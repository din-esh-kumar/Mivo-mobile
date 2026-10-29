import '../setup';
import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { useConversationStore, DEFAULT_CONVERSATIONS } from '../../src/stores/useConversationStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { socketClient } from '../../src/socket/socket-client';
import { REALTIME_EVENTS } from '../../src/constants/events';
import { ConversationDTO, ChatMessageDTO } from '../../src/types';

describe('Store: useConversationStore', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: 'u-self',
        username: 'alice',
        displayName: 'Alice Developer',
        email: 'alice@mivo.app',
        status: 'ONLINE',
        createdAt: '',
      },
    });

    useConversationStore.setState({
      conversations: DEFAULT_CONVERSATIONS,
      activeConversation: null,
      messages: {},
      typingUsers: {},
      isLoading: false,
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('initial state contains default conversations', () => {
    const state = useConversationStore.getState();
    assert.ok(state.conversations.length >= 2);
    assert.strictEqual(state.conversations[0].id, 'dm-1');
    assert.deepStrictEqual(state.messages, {});
  });

  test('loadConversations loads from API and updates list', async () => {
    const mockConvs: ConversationDTO[] = [
      {
        id: 'dm-lead',
        type: 'DIRECT',
        participants: [],
        unreadCount: 1,
        createdAt: '',
      },
    ];

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ success: true, data: mockConvs }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    await useConversationStore.getState().loadConversations();
    assert.strictEqual(useConversationStore.getState().conversations.length, 1);
    assert.strictEqual(useConversationStore.getState().conversations[0].id, 'dm-lead');
  });

  test('selectConversation updates activeConversation and calls loadConversationMessages', async () => {
    const targetConv: ConversationDTO = {
      id: 'dm-selected',
      type: 'DIRECT',
      participants: [],
      unreadCount: 0,
      createdAt: '',
    };

    const mockMsgs: ChatMessageDTO[] = [
      {
        id: 'm-101',
        conversationId: 'dm-selected',
        authorId: 'u-peer',
        author: { id: 'u-peer', username: 'bob', displayName: 'Bob' },
        content: 'Welcome to Mivo direct messaging!',
        createdAt: new Date().toISOString(),
      },
    ];

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ success: true, data: mockMsgs }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    await useConversationStore.getState().selectConversation(targetConv);

    const state = useConversationStore.getState();
    assert.strictEqual(state.activeConversation?.id, 'dm-selected');
    assert.strictEqual(state.messages['dm-selected']?.length, 1);
    assert.strictEqual(state.messages['dm-selected'][0].content, 'Welcome to Mivo direct messaging!');
  });

  test('sendMessage performs 0ms optimistic local update and emits socket message', () => {
    const targetId = 'chan-dev-chat';
    useConversationStore.getState().sendMessage(targetId, 'Ship the Expo SDK 58 build', false);

    const msgs = useConversationStore.getState().messages[targetId];
    assert.ok(msgs);
    assert.strictEqual(msgs.length, 1);
    assert.strictEqual(msgs[0].content, 'Ship the Expo SDK 58 build');
    assert.strictEqual(msgs[0].author.username, 'alice');
    assert.ok(msgs[0].id.startsWith('msg-'));
  });

  test('sendMessage with reply attaches referenced message metadata', () => {
    const targetId = 'dm-reply-test';
    const parentMsg: ChatMessageDTO = {
      id: 'msg-parent',
      conversationId: targetId,
      authorId: 'u-peer',
      author: { id: 'u-peer', username: 'carol', displayName: 'Carol' },
      content: 'Can you review the PR?',
      createdAt: '',
    };

    useConversationStore.setState({
      messages: { [targetId]: [parentMsg] },
    });

    useConversationStore.getState().sendMessage(targetId, 'Looks great to me!', true, 'msg-parent');

    const msgs = useConversationStore.getState().messages[targetId];
    assert.strictEqual(msgs.length, 2);
    assert.strictEqual(msgs[1].replyToMessageId, 'msg-parent');
    assert.strictEqual(msgs[1].replyTo?.content, 'Can you review the PR?');
  });

  test('createDirectConversation adds new conversation to store', async () => {
    const newConv: ConversationDTO = {
      id: 'dm-brand-new',
      type: 'DIRECT',
      participants: [],
      unreadCount: 0,
      createdAt: '',
    };

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ success: true, data: newConv }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    const res = await useConversationStore.getState().createDirectConversation('u-target');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data?.id, 'dm-brand-new');
    assert.strictEqual(useConversationStore.getState().conversations[0].id, 'dm-brand-new');
  });

  test('setupSocketListeners handles incoming messages and deduplicates / reconciles optimistic items', () => {
    const unsub = useConversationStore.getState().setupSocketListeners();
    const convId = 'dm-reconcile';

    // Send optimistic message first
    useConversationStore.getState().sendMessage(convId, 'Optimistic text', true);
    const msgsBefore = useConversationStore.getState().messages[convId];
    assert.strictEqual(msgsBefore.length, 1);
    assert.ok(msgsBefore[0].id.startsWith('msg-'));

    // Emit server confirmed message
    const confirmedMsg: ChatMessageDTO = {
      id: 'server-confirmed-uuid-1',
      conversationId: convId,
      authorId: 'u-self',
      author: { id: 'u-self', username: 'alice', displayName: 'Alice Developer' },
      content: 'Optimistic text',
      createdAt: new Date().toISOString(),
    };

    const triggerSocketEvent = (event: string, data: any) => {
      const cbs = (socketClient as any).listeners?.get(event);
      cbs?.forEach((cb: any) => cb(data));
    };

    triggerSocketEvent(REALTIME_EVENTS.DM_NEW_MESSAGE, confirmedMsg);

    const msgsAfter = useConversationStore.getState().messages[convId];
    assert.strictEqual(msgsAfter.length, 1);
    assert.strictEqual(msgsAfter[0].id, 'server-confirmed-uuid-1');

    // Emit duplicate
    triggerSocketEvent(REALTIME_EVENTS.DM_NEW_MESSAGE, confirmedMsg);
    assert.strictEqual(useConversationStore.getState().messages[convId].length, 1);

    // Test typing indicator
    triggerSocketEvent(REALTIME_EVENTS.DM_TYPING, {
      conversationId: convId,
      username: 'carol',
    });
    assert.ok(useConversationStore.getState().typingUsers[convId]?.includes('carol'));

    unsub();
  });
});
