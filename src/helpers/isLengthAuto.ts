export function isLengthAuto(length: 'auto' | number): length is 'auto' {
  return length === 'auto';
}
