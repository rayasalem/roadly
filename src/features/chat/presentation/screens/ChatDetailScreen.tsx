/**
 * Chat detail: messages for one conversation and send message. Uses GET /chat/conversations/:id/messages and POST .../messages.
 */
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { ErrorWithRetry } from '../../../../shared/components/ErrorWithRetry';
import { AppText } from '../../../../shared/components/AppText';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography } from '../../../../shared/theme';
import { fetchMessages, sendMessage, type ChatMessage } from '../../data/chatApi';
import { useUIStore } from '../../../../store/uiStore';
import { t } from '../../../../shared/i18n/t';

type ChatDetailRoute = { ChatDetail: { conversationId: string; name: string } };

export function ChatDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ChatDetailRoute, 'ChatDetail'>>();
  const { conversationId, name } = route.params ?? { conversationId: '', name: '' };
  const queryClient = useQueryClient();
  const toast = useUIStore((s) => s.toast);
  const [inputText, setInputText] = useState('');

  const {
    data: messages = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: () => fetchMessages(conversationId),
    enabled: !!conversationId,
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => sendMessage(conversationId, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] });
    },
  });

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || sendMutation.isPending) return;
    setInputText('');
    sendMutation.mutate(text, {
      onError: (e) => toast({ type: 'error', message: e instanceof Error ? e.message : t('common.error') }),
    });
  }, [inputText, sendMutation, toast]);

  if (!conversationId) {
    return (
      <View style={styles.center}>
        <AppText variant="body">{t('common.error')}</AppText>
      </View>
    );
  }

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorWithRetry message="" onRetry={() => refetch()} />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <AppHeader title={name} onBack={() => navigation.goBack()} />
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: ChatMessage }) => (
          <View style={[styles.bubble, item.sender === 'user' ? styles.bubbleUser : styles.bubbleProvider]}>
            <AppText variant="body" style={item.sender === 'user' ? styles.textUser : styles.textProvider}>
              {item.text}
            </AppText>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('chat.placeholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || sendMutation.isPending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || sendMutation.isPending}
        >
          <MaterialCommunityIcons name="send" size={22} color={colors.primaryContrast} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  list: { padding: spacing.lg, paddingBottom: spacing.xl },
  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.sm,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  bubbleProvider: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
  },
  textUser: { color: colors.primaryContrast },
  textProvider: { color: colors.text },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.body.fontSize,
    color: colors.text,
    marginRight: spacing.sm,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
});
