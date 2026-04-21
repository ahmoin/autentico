import { Slider } from "@/components/ui/slider";

export function LabeledSlider({
	label,
	value,
	min,
	max,
	valueLabel,
	onChange,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	valueLabel: string;
	onChange: (v: number) => void;
}) {
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between text-xs">
				<span className="text-muted-foreground">{label}</span>
				{valueLabel && <span className="font-medium">{valueLabel}</span>}
			</div>
			<Slider
				min={min}
				max={max}
				step={1}
				value={[value]}
				onValueChange={([v]) => onChange(v)}
			/>
		</div>
	);
}
