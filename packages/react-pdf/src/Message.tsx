type MessageProps = {
  children?: React.ReactNode;
  type: 'error' | 'loading' | 'no-data';
};

export default function Message({ children, type }: MessageProps): React.ReactElement {
  return <div className={`react-pdf__message react-pdf__message--${type}`}>{children}</div>;
}
