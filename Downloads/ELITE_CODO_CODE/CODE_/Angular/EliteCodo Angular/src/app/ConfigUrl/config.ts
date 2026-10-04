export const MainURL = {
  HostURL: typeof window !== 'undefined' && window.location.port !== '4200'
    ? window.location.origin + '/'
    : 'http://localhost:8583/',
  ReactWeb: typeof window !== 'undefined' && window.location.port !== '4200'
    ? window.location.origin + '/question-portal'
    : 'http://127.0.0.1:3001',
};
