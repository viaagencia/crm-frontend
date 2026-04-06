export function Tabs(props: any) { return <div {...props} />; }
export function TabsList(props: any) { return <div {...props} style={{display: 'flex', gap: '10px', ...props.style}} />; }
export function TabsTrigger(props: any) { return <button {...props} style={{padding: '10px', ...props.style}} />; }
export function TabsContent(props: any) { return <div {...props} />; }
