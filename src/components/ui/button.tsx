export function Button(props: any) {
  return <button {...props} style={{padding: '10px 20px', borderRadius: '4px', ...props.style}} />;
}
