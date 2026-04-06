export function Input(props: any) {
  return <input {...props} style={{padding: '10px', border: '1px solid #ddd', borderRadius: '4px', ...props.style}} />;
}
