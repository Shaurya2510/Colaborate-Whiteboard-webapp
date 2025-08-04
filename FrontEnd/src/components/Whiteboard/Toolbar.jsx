import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Pencil, LineChart, Square, Undo2, Redo2, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"

const Toolbar = ({ tool, setTool, color, setColor, onUndo, onRedo, onClear, disableUndo, disableRedo }) => {
    return (
        <div className="flex gap-4 items-center bg-gray-800 p-3 shadow rounded-md w-full justify-center flex-wrap">
            <ToggleGroup type="single" value={tool} onValueChange={setTool} className="gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <ToggleGroupItem value="pencil" aria-label="Pencil">
                                <Pencil className="w-4 h-4" />
                            </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>Pencil</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <ToggleGroupItem value="line" aria-label="Line">
                                <LineChart className="w-4 h-4" />
                            </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>Line</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <ToggleGroupItem value="rect" aria-label="Rectangle">
                                <Square className="w-4 h-4" />
                            </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>Rectangle</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </ToggleGroup>

            <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 border-none p-0 bg-transparent cursor-pointer"
            />

            <div className="flex gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={onUndo} disabled={disableUndo} variant="outline" size="icon">
                                <Undo2 className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Undo</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={onRedo} disabled={disableRedo} variant="outline" size="icon">
                                <Redo2 className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Redo</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={onClear} variant="destructive" size="icon">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clear</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}

export default Toolbar
