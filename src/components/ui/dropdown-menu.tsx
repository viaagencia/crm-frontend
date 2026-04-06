export function DropdownMenu(props: any) { return <div {...props} />; }
export function DropdownMenuTrigger(props: any) { return <button {...props} />; }
export function DropdownMenuContent(props: any) { return <div {...props} style={{background: 'white', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', ...props.style}} />; }
export function DropdownMenuItem(props: any) { return <button {...props} style={{display: 'block', width: '100%', padding: '10px', textAlign: 'left', ...props.style}} />; }
export function DropdownMenuSeparator(props: any) { return <div {...props} style={{height: '1px', background: '#eee', ...props.style}} />; }
