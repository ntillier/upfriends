
export default function Loading () {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
            <div style={{ display: 'inline-block', width: '32px', height: '32px', border: 'solid 3px var(--purple)', borderRightColor: 'transparent', borderRadius: '100px', animation: 'loading infinite linear .6s' }} />
        </div>
    );
}