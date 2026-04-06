export function Dialog(props: any) { return <div {...props} />; }
export function DialogTrigger(props: any) { return <button {...props} />; }
export function DialogContent(props: any) { return <div {...props} style={{background: 'white', borderRadius: '8px', padding: '20px', ...props.style}} />; }
export function DialogHeader(props: any) { return <div {...props} />; }
export function DialogTitle(props: any) { return <h2 {...props} />; }
export function DialogDescription(props: any) { return <p {...props} />; }
export function DialogFooter(props: any) { return <div {...props} />; }
