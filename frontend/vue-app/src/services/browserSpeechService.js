export function getBrowserSpeechSupport() {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      reason: 'Speech recognition is only available in a browser.'
    };
  }

  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  if (!Recognition) {
    return {
      supported: false,
      reason: 'This browser does not expose SpeechRecognition. Please use text input instead.'
    };
  }

  return {
    supported: true,
    Recognition
  };
}

export function createOneShotSpeechRecognizer({
  lang = 'zh-CN',
  onStart,
  onInterim,
  onResult,
  onError,
  onEnd
} = {}) {
  const support = getBrowserSpeechSupport();
  if (!support.supported) {
    onError?.({ reason: 'unsupported', message: support.reason });
    return null;
  }

  const recognition = new support.Recognition();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => onStart?.();
  recognition.onresult = (event) => {
    let interim = '';
    let finalText = '';
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const transcript = event.results[index][0]?.transcript || '';
      if (event.results[index].isFinal) {
        finalText += transcript;
      } else {
        interim += transcript;
      }
    }
    if (interim) onInterim?.(interim.trim());
    if (finalText.trim()) onResult?.(finalText.trim());
  };
  recognition.onerror = (event) => {
    onError?.({
      reason: event.error || 'speech_error',
      message: mapSpeechError(event.error)
    });
  };
  recognition.onend = () => onEnd?.();

  return recognition;
}

export function speechLangForLocale(locale = 'zh') {
  return {
    zh: 'zh-CN',
    en: 'en-US',
    ko: 'ko-KR',
    ar: 'ar-SA'
  }[locale] || 'zh-CN';
}

function mapSpeechError(error) {
  const messages = {
    'not-allowed': 'Microphone permission was denied. Please use text input or allow microphone access.',
    'service-not-allowed': 'Speech recognition is blocked by the browser. Please use text input.',
    'no-speech': 'No speech was detected. Please try again or use text input.',
    'audio-capture': 'No microphone was found. Please use text input.',
    network: 'Browser speech recognition is unavailable right now. Please use text input.',
    aborted: 'Speech recognition was stopped.'
  };
  return messages[error] || 'Speech recognition stopped. Please try again or use text input.';
}
