import { Button } from "../../components/ui";

export default function Home () {
    return (
        <div style={{ display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, height: '100vh', width: '100vw' }}>
            <h1>Home ;)</h1>
            <Button to="/login">LOGIN</Button>
        </div>
    );
}