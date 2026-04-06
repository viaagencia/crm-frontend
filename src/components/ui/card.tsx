export function Card(props: any) {
  return <div {...props} style={{background: 'white', borderRadius: '8px', padding: '20px', ...props.style}} />;
}

export function CardHeader(props: any) { return <div {...props} />; }
export function CardTitle(props: any) { return <h2 {...props} />; }
export function CardContent(props: any) { return <div {...props} />; }
