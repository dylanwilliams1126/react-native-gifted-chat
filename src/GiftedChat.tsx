import PropTypes from 'prop-types'
import React, { useRef, useEffect, useState, useMemo } from 'react'
import {
  Animated,
  Platform,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  FlatList,
  TextStyle,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  TextInput,
} from 'react-native'
import {
  ActionSheetProvider,
  ActionSheetOptions,
} from '@expo/react-native-action-sheet'
import uuid from 'uuid'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'

import * as utils from './utils'
import { Actions, ActionsProps } from './Actions'
import { Avatar, AvatarProps } from './Avatar'
import Bubble from './Bubble'
import { SystemMessage, SystemMessageProps } from './SystemMessage'
import { MessageImage, MessageImageProps } from './MessageImage'
import { MessageText, MessageTextProps } from './MessageText'
import { Composer, ComposerProps } from './Composer'
import { Day, DayProps } from './Day'
import { InputToolbar, InputToolbarProps } from './InputToolbar'
import { LoadEarlier, LoadEarlierProps } from './LoadEarlier'
import Message from './Message'
import MessageContainer from './MessageContainer'
import { Send, SendProps } from './Send'
import { GiftedChatContext } from './GiftedChatContext'
import { Time, TimeProps } from './Time'
import { QuickRepliesProps } from './QuickReplies'
import GiftedAvatar from './GiftedAvatar'

import {
  MIN_COMPOSER_HEIGHT,
  MAX_COMPOSER_HEIGHT,
  DEFAULT_PLACEHOLDER,
  TIME_FORMAT,
  DATE_FORMAT,
  TEST_ID,
} from './Constant'
import {
  IMessage,
  User,
  Reply,
  LeftRightStyle,
  MessageVideoProps,
  MessageAudioProps,
} from './Models'
import { LightboxProps } from 'react-native-lightbox-v2'
import { ActionSheetProviderRef } from '@expo/react-native-action-sheet'

dayjs.extend(localizedFormat)

export interface GiftedChatProps<TMessage extends IMessage = IMessage> {
  /* Messages to display */
  messages?: TMessage[]
  /* Typing Indicator state */
  isTyping?: boolean
  /* Messages container style */
  messagesContainerStyle?: StyleProp<ViewStyle>
  /* Input text; default is undefined, but if specified, it will override GiftedChat's internal state */
  text?: string
  /* Controls whether or not the message bubbles appear at the top of the chat */
  alignTop?: boolean
  /* enables the scrollToBottom Component */
  scrollToBottom?: boolean
  /* Scroll to bottom wrapper style */
  scrollToBottomStyle?: StyleProp<ViewStyle>
  initialText?: string
  /* Placeholder when text is empty; default is 'Type a message...' */
  placeholder?: string
  /* Makes the composer not editable*/
  disableComposer?: boolean
  /* User sending the messages: { _id, name, avatar } */
  user?: User
  /*  Locale to localize the dates */
  locale?: string
  /* Format to use for rendering times; default is 'LT' */
  timeFormat?: string
  /* Format to use for rendering dates; default is 'll' */
  dateFormat?: string
  /* Enables the "Load earlier messages" button */
  loadEarlier?: boolean
  /*Display an ActivityIndicator when loading earlier messages*/
  isLoadingEarlier?: boolean
  /* Whether to render an avatar for the current user; default is false, only show avatars for other users */
  showUserAvatar?: boolean
  /* When false, avatars will only be displayed when a consecutive message is from the same user on the same day; default is false */
  showAvatarForEveryMessage?: boolean
  /* Render the message avatar at the top of consecutive messages, rather than the bottom; default is false */
  isKeyboardInternallyHandled?: boolean
  /* Determine whether to handle keyboard awareness inside the plugin. If you have your own keyboard handling outside the plugin set this to false; default is true */
  renderAvatarOnTop?: boolean
  inverted?: boolean
  /* Extra props to be passed to the <Image> component created by the default renderMessageImage */
  imageProps?: Message<TMessage>['props']
  /*Extra props to be passed to the MessageImage's Lightbox */
  lightboxProps?: LightboxProps
  /*Distance of the chat from the bottom of the screen (e.g. useful if you display a tab bar) */
  bottomOffset?: number
  /* Minimum height of the input toolbar; default is 44 */
  minInputToolbarHeight?: number
  /*Extra props to be passed to the messages <ListView>; some props can't be overridden, see the code in MessageContainer.render() for details */
  listViewProps?: any
  /*  Extra props to be passed to the <TextInput> */
  textInputProps?: any
  /*Determines whether the keyboard should stay visible after a tap; see <ScrollView> docs */
  keyboardShouldPersistTaps?: any
  /*Max message composer TextInput length */
  maxInputLength?: number
  /* Force getting keyboard height to fix some display issues */
  forceGetKeyboardHeight?: boolean
  /* Force send button */
  alwaysShowSend?: boolean
  /* Image style */
  imageStyle?: StyleProp<ViewStyle>
  /* This can be used to pass any data which needs to be re-rendered */
  extraData?: any
  /* composer min Height */
  minComposerHeight?: number
  /* composer min Height */
  maxComposerHeight?: number
  options?: { [key: string]: any }
  optionTintColor?: string
  quickReplyStyle?: StyleProp<ViewStyle>
  quickReplyTextStyle?: StyleProp<TextStyle>
  /* optional prop used to place customView below text, image and video views; default is false */
  isCustomViewBottom?: boolean
  /* infinite scroll up when reach the top of messages container, automatically call onLoadEarlier function if exist */
  infiniteScroll?: boolean
  timeTextStyle?: LeftRightStyle<TextStyle>
  /* Custom action sheet */
  actionSheet?(): {
    showActionSheetWithOptions: (
      options: ActionSheetOptions,
      callback: (i: number) => void,
    ) => void
  }
  /* Callback when a message avatar is tapped */
  onPressAvatar?(user: User): void
  /* Callback when a message avatar is tapped */
  onLongPressAvatar?(user: User): void
  /* Generate an id for new messages. Defaults to UUID v4, generated by uuid */
  messageIdGenerator?(message?: TMessage): string
  /* Callback when sending a message */
  onSend?(messages: TMessage[]): void
  /*Callback when loading earlier messages*/
  onLoadEarlier?(): void
  /*  Render a loading view when initializing */
  renderLoading?(): React.ReactNode
  /* Custom "Load earlier messages" button */
  renderLoadEarlier?(props: LoadEarlierProps): React.ReactNode
  /* Custom message avatar; set to null to not render any avatar for the message */
  renderAvatar?(props: AvatarProps<TMessage>): React.ReactNode | null
  /* Custom message bubble */
  renderBubble?(props: Bubble<TMessage>['props']): React.ReactNode
  /*Custom system message */
  renderSystemMessage?(props: SystemMessageProps<TMessage>): React.ReactNode
  /* Callback when a message bubble is pressed; default is to do nothing */
  onPress?(context: any, message: TMessage): void
  /* Callback when a message bubble is long-pressed; default is to show an ActionSheet with "Copy Text" (see example using showActionSheetWithOptions()) */
  onLongPress?(context: any, message: TMessage): void
  /*Custom Username container */
  renderUsername?(user: User): React.ReactNode
  /* Reverses display order of messages; default is true */
  /*Custom message container */
  renderMessage?(message: Message<TMessage>['props']): React.ReactNode
  /* Custom message text */
  renderMessageText?(messageText: MessageTextProps<TMessage>): React.ReactNode
  /* Custom message image */
  renderMessageImage?(props: MessageImageProps<TMessage>): React.ReactNode
  /* Custom message video */
  renderMessageVideo?(props: MessageVideoProps<TMessage>): React.ReactNode
  /* Custom message video */
  renderMessageAudio?(props: MessageAudioProps<TMessage>): React.ReactNode
  /* Custom view inside the bubble */
  renderCustomView?(props: Bubble<TMessage>['props']): React.ReactNode
  /*Custom day above a message*/
  renderDay?(props: DayProps<TMessage>): React.ReactNode
  /* Custom time inside a message */
  renderTime?(props: TimeProps<TMessage>): React.ReactNode
  /* Custom footer component on the ListView, e.g. 'User is typing...' */
  renderFooter?(): React.ReactNode
  /* Custom component to render in the ListView when messages are empty */
  renderChatEmpty?(): React.ReactNode
  /* Custom component to render below the MessageContainer (separate from the ListView) */
  renderChatFooter?(): React.ReactNode
  /* Custom message composer container */
  renderInputToolbar?(props: InputToolbarProps<TMessage>): React.ReactNode
  /*  Custom text input message composer */
  renderComposer?(props: ComposerProps): React.ReactNode
  /* Custom action button on the left of the message composer */
  renderActions?(props: ActionsProps): React.ReactNode
  /* Custom send button; you can pass children to the original Send component quite easily, for example to use a custom icon (example) */
  renderSend?(props: SendProps<TMessage>): React.ReactNode
  /*Custom second line of actions below the message composer */
  renderAccessory?(props: InputToolbarProps<TMessage>): React.ReactNode
  /*Callback when the Action button is pressed (if set, the default actionSheet will not be used) */
  onPressActionButton?(): void
  /* Callback when the input text changes */
  onInputTextChanged?(text: string): void
  /* Custom parse patterns for react-native-parsed-text used to linking message content (like URLs and phone numbers) */
  parsePatterns?(linkStyle: TextStyle): any
  onQuickReply?(replies: Reply[]): void
  renderQuickReplies?(
    quickReplies: QuickRepliesProps<TMessage>,
  ): React.ReactNode
  renderQuickReplySend?(): React.ReactNode
  /* Scroll to bottom custom component */
  scrollToBottomComponent?(): React.ReactNode
  shouldUpdateMessage?(
    props: Message<TMessage>['props'],
    nextProps: Message<TMessage>['props'],
  ): boolean
}

export interface GiftedChatState<TMessage extends IMessage = IMessage> {
  isInitialized: boolean
  composerHeight?: number
  messagesContainerHeight?: number | Animated.Value
  typingDisabled: boolean
  text?: string
  messages?: TMessage[]
}

function GiftedChat(props: GiftedChatProps) {
  const {
    messages = [],
    messagesContainerStyle = undefined,
    text = undefined,
    initialText = '',
    isTyping,
    placeholder = DEFAULT_PLACEHOLDER,
    disableComposer = false,
    messageIdGenerator = () => uuid.v4(),
    user = {},
    onSend = () => {},
    locale = null,
    timeFormat = TIME_FORMAT,
    dateFormat = DATE_FORMAT,
    loadEarlier = false,
    onLoadEarlier = () => {},
    isLoadingEarlier = false,
    renderLoading = null,
    renderLoadEarlier = null,
    renderAvatar = undefined,
    showUserAvatar = false,
    actionSheet = null,
    onPressAvatar = null,
    onLongPressAvatar = null,
    renderUsernameOnMessage = false,
    renderAvatarOnTop = false,
    renderBubble = null,
    renderSystemMessage = null,
    onLongPress = null,
    renderUserName = null,
    renderMessage = null,
    renderMessageText = null,
    renderMessageImage = null,
    renderMessageVideo = null,
    renderMessageAudio = null,
    imageProps = {},
    videoProps = {},
    audioProps = {},
    lightboxProps = {},
    textInputProps = {},
    listViewProps = {},
    renderCustomView = null,
    isCustomViewBottom = false,
    renderDay = null,
    renderTime = null,
    renderFooter = null,
    renderChatEmpty = null,
    renderChatFooter = null,
    renderInputToolbar = null,
    renderComposer = null,
    renderActions = null,
    renderSend = null,
    renderAccessory = null,
    isKeyboardInternallyHandled = true,
    onPressActionButton = null,
    bottomOffset = null,
    minInputToolbarHeight = 44,
    keyboardShouldPersistTaps = Platform.select({
      ios: 'never',
      android: 'always',
      default: 'never',
    }),
    onInputTextChanged = null,
    maxInputLength = null,
    forceGetKeyboardHeight = false,
    inverted = true,
    extraData = null,
    minComposerHeight = MIN_COMPOSER_HEIGHT,
    maxComposerHeight = MAX_COMPOSER_HEIGHT,
  } = props

  const _isMounted = useRef(false)
  const _keyboardHeight = useRef(0)
  const _bottomOffset = useRef(0)
  const _maxHeight = useRef<number | undefined>(undefined)
  const _isFirstLayout = useRef(true)
  let _locale: string = 'en'
  let _actionSheetRef = useRef<ActionSheetProviderRef>()
  let _messageContainerRef = useRef<FlatList<IMessage> | null>()
  let _isTextInputWasFocused: boolean = false
  let textInputRef = useRef<TextInput>()

  const [state, setState] = useState<GiftedChatState>({
    isInitialized: false, // initialization will calculate maxHeight before rendering the chat
    composerHeight: minComposerHeight,
    messagesContainerHeight: undefined,
    typingDisabled: false,
    text: undefined,
    messages: undefined,
  })

  useEffect(() => {
    setIsMounted(true)
    initLocale()
    setMessages(messages)
    setTextFromProp(text)

    if (inverted === false && messages?.length) {
      setTimeout(() => scrollToBottom(false), 200)
    }

    return () => {
      setIsMounted(false)
    }
  }, [messages, text])

  const initLocale = () => {
    if (locale === null) {
      setLocale('en')
    } else {
      setLocale(locale || 'en')
    }
  }

  const setLocale = (locale: string) => {
    _locale = locale
  }

  const getLocale = () => _locale

  const setTextFromProp = (textProp?: string) => {
    // Text prop takes precedence over state.
    if (textProp !== undefined && textProp !== state.text) {
      setState({ ...state, text: textProp })
    }
  }

  const getTextFromProp = (fallback: string) => {
    if (text === undefined) {
      return fallback
    }
    return text
  }

  const setMessages = (messages: TMessage[]) => {
    setState({ ...state, messages })
  }

  const getMessages = () => {
    return state.messages
  }

  const setMaxHeight = (height: number) => {
    _maxHeight.current = height
  }

  const getMaxHeight = () => {
    return _maxHeight.current
  }

  const setKeyboardHeight = (height: number) => {
    _keyboardHeight.current = height
  }

  const getKeyboardHeight = () => {
    if (Platform.OS === 'android' && !forceGetKeyboardHeight) {
      // For android: on-screen keyboard resized main container and has own height.
      // @see https://developer.android.com/training/keyboard-input/visibility.html
      // So for calculate the messages container height ignore keyboard height.
      return 0
    }
    return _keyboardHeight.current
  }

  const setBottomOffset = (value: number) => {
    _bottomOffset.current = value
  }

  const getBottomOffset = () => {
    return _bottomOffset.current
  }

  const setIsFirstLayout = (value: boolean) => {
    _isFirstLayout.current = value
  }

  const getIsFirstLayout = () => {
    return _isFirstLayout.current
  }

  const setIsTypingDisabled = (value: boolean) => {
    setState({
      ...state,
      typingDisabled: value,
    })
  }

  const getIsTypingDisabled = () => {
    return state.typingDisabled
  }

  const setIsMounted = (value: boolean) => {
    _isMounted.current = value
  }

  const getIsMounted = () => {
    return _isMounted.current
  }

  const getMinInputToolbarHeight = () => {
    return renderAccessory ? minInputToolbarHeight! * 2 : minInputToolbarHeight
  }

  const calculateInputToolbarHeight = (composerHeight: number) => {
    return composerHeight + (getMinInputToolbarHeight()! - minComposerHeight!)
  }

  /**
   * Returns the height, based on current window size, without taking the keyboard into account.
   */
  const getBasicMessagesContainerHeight = (
    composerHeight = state.composerHeight,
  ) => {
    return getMaxHeight()! - calculateInputToolbarHeight(composerHeight!)
  }

  /**
   * Returns the height, based on current window size, taking the keyboard into account.
   */
  const getMessagesContainerHeightWithKeyboard = (
    composerHeight = state.composerHeight,
  ) => {
    return (
      getBasicMessagesContainerHeight(composerHeight) -
      getKeyboardHeight() +
      getBottomOffset()
    )
  }

  /**
   * Store text input focus status when keyboard hide to retrieve
   * it after wards if needed.
   * `onKeyboardWillHide` may be called twice in sequence so we
   * make a guard condition (eg. showing image picker)
   */
  const handleTextInputFocusWhenKeyboardHide = () => {
    if (!_isTextInputWasFocused) {
      _isTextInputWasFocused = textInputRef.current?.isFocused() || false
    }
  }

  /**
   * Refocus the text input only if it was focused before showing keyboard.
   * This is needed in some cases (eg. showing image picker).
   */
  const handleTextInputFocusWhenKeyboardShow = () => {
    if (
      textInputRef.current &&
      _isTextInputWasFocused &&
      !textInputRef.current.isFocused()
    ) {
      textInputRef.current.focus()
    }

    // Reset the indicator since the keyboard is shown
    _isTextInputWasFocused = false
  }

  const onKeyboardWillShow = (e: any) => {
    handleTextInputFocusWhenKeyboardShow()

    if (isKeyboardInternallyHandled) {
      setIsTypingDisabled(true)
      setKeyboardHeight(
        e.endCoordinates ? e.endCoordinates.height : e.end.height,
      )
      setBottomOffset(bottomOffset != null ? bottomOffset : 1)
      const newMessagesContainerHeight = getMessagesContainerHeightWithKeyboard()
      setState({
        ...state,
        messagesContainerHeight: newMessagesContainerHeight,
      })
    }
  }

  const onKeyboardWillHide = (_e: any) => {
    handleTextInputFocusWhenKeyboardHide()

    if (isKeyboardInternallyHandled) {
      setIsTypingDisabled(true)
      setKeyboardHeight(0)
      setBottomOffset(0)
      const newMessagesContainerHeight = getBasicMessagesContainerHeight()
      setState({
        ...state,
        messagesContainerHeight: newMessagesContainerHeight,
      })
    }
  }

  const onKeyboardDidShow = (e: any) => {
    if (Platform.OS === 'android') {
      onKeyboardWillShow(e)
    }
    setIsTypingDisabled(false)
  }

  const onKeyboardDidHide = (e: any) => {
    if (Platform.OS === 'android') {
      onKeyboardWillHide(e)
    }
    setIsTypingDisabled(false)
  }

  const scrollToBottom = (animated = true) => {
    if (_messageContainerRef && _messageContainerRef.current) {
      const { inverted } = props
      if (!inverted) {
        _messageContainerRef.current.scrollToEnd({ animated })
      } else {
        _messageContainerRef.current.scrollToOffset({
          offset: 0,
          animated,
        })
      }
    }
  }

  const renderMessages = () => {
    const { messagesContainerStyle, ...messagesContainerProps } = props
    const fragment = (
      <View
        style={[
          state.messagesContainerHeight && {
            height: state.messagesContainerHeight,
          },
          messagesContainerStyle,
        ]}
      >
        <MessageContainer<TMessage>
          {...messagesContainerProps}
          invertibleScrollViewProps={{
            inverted: inverted,
            keyboardShouldPersistTaps: keyboardShouldPersistTaps,
            onKeyboardWillShow: onKeyboardWillShow,
            onKeyboardWillHide: onKeyboardWillHide,
            onKeyboardDidShow: onKeyboardDidShow,
            onKeyboardDidHide: onKeyboardDidHide,
          }}
          messages={getMessages()}
          forwardRef={_messageContainerRef}
          isTyping={isTyping}
        />
        {_renderChatFooter()}
      </View>
    )

    return isKeyboardInternallyHandled ? (
      <KeyboardAvoidingView enabled>{fragment}</KeyboardAvoidingView>
    ) : (
      fragment
    )
  }

  const _onSend = (
    messages: TMessage[] = [],
    shouldResetInputToolbar = false,
  ) => {
    if (!Array.isArray(messages)) {
      messages = [messages]
    }
    const newMessages: TMessage[] = messages.map(message => {
      return {
        ...message,
        user: user!,
        createdAt: new Date(),
        _id: messageIdGenerator && messageIdGenerator(),
      }
    })

    if (shouldResetInputToolbar === true) {
      setIsTypingDisabled(true)
      resetInputToolbar()
    }
    if (onSend) {
      onSend(newMessages)
    }

    // if (shouldResetInputToolbar === true) {
    //   setTimeout(() => {
    //     if (getIsMounted() === true) {
    //       setIsTypingDisabled(false)
    //     }
    //   }, 100)
    // }
  }

  const resetInputToolbar = () => {
    if (textInputRef.current) {
      textInputRef.current.clear()
    }
    notifyInputTextReset()
    const newComposerHeight = minComposerHeight
    const newMessagesContainerHeight = getMessagesContainerHeightWithKeyboard(
      newComposerHeight,
    )
    setState({
      ...state,
      text: getTextFromProp(''),
      composerHeight: newComposerHeight,
      messagesContainerHeight: newMessagesContainerHeight,
    })
  }

  const focusTextInput = () => {
    if (textInputRef.current) {
      textInputRef.current.focus()
    }
  }

  const onInputSizeChanged = (size: { height: number }) => {
    const newComposerHeight = Math.max(
      minComposerHeight!,
      Math.min(maxComposerHeight!, size.height),
    )
    const newMessagesContainerHeight = getMessagesContainerHeightWithKeyboard(
      newComposerHeight,
    )
    setState({
      ...state,
      composerHeight: newComposerHeight,
      messagesContainerHeight: newMessagesContainerHeight,
    })
  }

  const _onInputTextChanged = (_text: string) => {
    if (getIsTypingDisabled()) {
      return
    }
    if (onInputTextChanged) {
      onInputTextChanged(_text)
    }
    // Only set state if it's not being overridden by a prop.
    if (text === undefined) {
      setState({ ...state, text: _text })
    }
  }

  const notifyInputTextReset = () => {
    if (onInputTextChanged) {
      onInputTextChanged('')
    }
  }

  const onInitialLayoutViewLayout = (e: any) => {
    const { layout } = e.nativeEvent
    if (layout.height <= 0) {
      return
    }
    notifyInputTextReset()
    setMaxHeight(layout.height)
    const newComposerHeight = minComposerHeight
    const newMessagesContainerHeight = getMessagesContainerHeightWithKeyboard(
      newComposerHeight,
    )
    setState({
      ...state,
      isInitialized: true,
      text: getTextFromProp(initialText),
      composerHeight: newComposerHeight,
      messagesContainerHeight: newMessagesContainerHeight,
    })
  }

  const onMainViewLayout = (e: LayoutChangeEvent) => {
    // TODO: fix an issue when keyboard is dismissing during the initialization
    const { layout } = e.nativeEvent
    if (getMaxHeight() !== layout.height || getIsFirstLayout() === true) {
      setMaxHeight(layout.height)
      setState({
        ...state,
        messagesContainerHeight:
          _keyboardHeight.current > 0
            ? getMessagesContainerHeightWithKeyboard()
            : getBasicMessagesContainerHeight(),
      })
    }
    if (getIsFirstLayout() === true) {
      setIsFirstLayout(false)
    }
  }

  const _renderInputToolbar = () => {
    const inputToolbarProps = {
      ...props,
      text: getTextFromProp(state.text!),
      composerHeight: Math.max(minComposerHeight!, state.composerHeight!),
      onSend: _onSend,
      onInputSizeChanged: onInputSizeChanged,
      onTextChanged: _onInputTextChanged,
      textInputProps: {
        ...textInputProps,
        ref: (textInput: any) => (textInputRef = textInput),
        maxLength: getIsTypingDisabled() ? 0 : maxInputLength,
      },
    }
    if (renderInputToolbar) {
      return renderInputToolbar(inputToolbarProps)
    }
    return <InputToolbar {...inputToolbarProps} />
  }

  const _renderChatFooter = () => {
    if (renderChatFooter) {
      return renderChatFooter()
    }
    return null
  }

  const _renderLoading = () => {
    if (renderLoading) {
      return renderLoading()
    }
    return null
  }

  if (state.isInitialized === true) {
    const contextValues = useMemo(() => ({
      actionSheet: actionSheet || (() => _actionSheetRef.current?.getContext()!),
      getLocale: getLocale,
    }), [actionSheet, locale])
    return (
      <GiftedChatContext.Provider
        value={contextValues}
      >
        <View testID={TEST_ID.WRAPPER} style={styles.wrapper}>
          <ActionSheetProvider ref={_actionSheetRef}>
            <View style={styles.container} onLayout={onMainViewLayout}>
              {renderMessages()}
              {_renderInputToolbar()}
            </View>
          </ActionSheetProvider>
        </View>
      </GiftedChatContext.Provider>
    )
  }
  return (
    <View
      testID={TEST_ID.LOADING_WRAPPER}
      style={styles.container}
      onLayout={onInitialLayoutViewLayout}
    >
      {_renderLoading()}
    </View>
  )
}

GiftedChat.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object),
  messagesContainerStyle: utils.StylePropType,
  text: PropTypes.string,
  initialText: PropTypes.string,
  placeholder: PropTypes.string,
  disableComposer: PropTypes.bool,
  messageIdGenerator: PropTypes.func,
  user: PropTypes.object,
  onSend: PropTypes.func,
  locale: PropTypes.string,
  timeFormat: PropTypes.string,
  dateFormat: PropTypes.string,
  isKeyboardInternallyHandled: PropTypes.bool,
  loadEarlier: PropTypes.bool,
  onLoadEarlier: PropTypes.func,
  isLoadingEarlier: PropTypes.bool,
  renderLoading: PropTypes.func,
  renderLoadEarlier: PropTypes.func,
  renderAvatar: PropTypes.func,
  showUserAvatar: PropTypes.bool,
  actionSheet: PropTypes.func,
  onPressAvatar: PropTypes.func,
  onLongPressAvatar: PropTypes.func,
  renderUsernameOnMessage: PropTypes.bool,
  renderAvatarOnTop: PropTypes.bool,
  isCustomViewBottom: PropTypes.bool,
  renderBubble: PropTypes.func,
  renderSystemMessage: PropTypes.func,
  onLongPress: PropTypes.func,
  renderMessage: PropTypes.func,
  renderMessageText: PropTypes.func,
  renderMessageImage: PropTypes.func,
  imageProps: PropTypes.object,
  videoProps: PropTypes.object,
  audioProps: PropTypes.object,
  lightboxProps: PropTypes.object,
  renderCustomView: PropTypes.func,
  renderDay: PropTypes.func,
  renderTime: PropTypes.func,
  renderFooter: PropTypes.func,
  renderChatEmpty: PropTypes.func,
  renderChatFooter: PropTypes.func,
  renderInputToolbar: PropTypes.func,
  renderComposer: PropTypes.func,
  renderActions: PropTypes.func,
  renderSend: PropTypes.func,
  renderAccessory: PropTypes.func,
  onPressActionButton: PropTypes.func,
  bottomOffset: PropTypes.number,
  minInputToolbarHeight: PropTypes.number,
  listViewProps: PropTypes.object,
  keyboardShouldPersistTaps: PropTypes.oneOf(['always', 'never', 'handled']),
  onInputTextChanged: PropTypes.func,
  maxInputLength: PropTypes.number,
  forceGetKeyboardHeight: PropTypes.bool,
  inverted: PropTypes.bool,
  textInputProps: PropTypes.object,
  extraData: PropTypes.object,
  minComposerHeight: PropTypes.number,
  maxComposerHeight: PropTypes.number,
  alignTop: PropTypes.bool,
}

GiftedChat.append = <TMessage extends IMessage>(
  currentMessages: TMessage[] = [],
  messages: TMessage[],
  inverted = true,
) => {
  if (!Array.isArray(messages)) {
    messages = [messages]
  }
  return inverted
    ? messages.concat(currentMessages)
    : currentMessages.concat(messages)
}

GiftedChat.prepend = <TMessage extends IMessage>(
  currentMessages: TMessage[] = [],
  messages: TMessage[],
  inverted = true,
) => {
  if (!Array.isArray(messages)) {
    messages = [messages]
  }
  return inverted
    ? currentMessages.concat(messages)
    : messages.concat(currentMessages)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
})

export * from './Models'

export {
  GiftedChat,
  Actions,
  Avatar,
  Bubble,
  SystemMessage,
  MessageImage,
  MessageText,
  Composer,
  Day,
  InputToolbar,
  LoadEarlier,
  Message,
  MessageContainer,
  Send,
  Time,
  GiftedAvatar,
  utils,
}
