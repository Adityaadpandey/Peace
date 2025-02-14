import GradientButton from "./GradientButton";

interface NavbarProps {
    className?: string;
}

export default function Navbar({ className }: NavbarProps) {
    return (
        <nav className={`flex justify-between p-4 gap-4 ${className} w-screen`}>
            <div>logo</div>
            <div className="flex gap-4">
                <GradientButton className="rounded-xl border-gray-500 border">Home</GradientButton>
                <GradientButton className="rounded-xl border-gray-500 border">Services</GradientButton>
                <GradientButton className="rounded-xl border-gray-500 border">Social</GradientButton>
                <GradientButton className="rounded-xl border-gray-500 border">About</GradientButton>
                <GradientButton className="rounded-xl border-gray-500 border">Contact</GradientButton>
            </div>
            <div>join</div>
        </nav>
    )
}