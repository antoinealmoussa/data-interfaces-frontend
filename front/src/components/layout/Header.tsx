import { DropdownMenu } from "../ui/DropdownMenu";
import { randomWord } from "../../utils/randomData";

export const Header: React.FC = () => {
    return (
        <div className="bg-white p-4 shadow-sm">
            <div className="flex">
                {Array.from({ length: 4 }).map((_, i) => (
                    <DropdownMenu key={i} title={randomWord()} />
                ))}
            </div>
        </div>
    );
};
