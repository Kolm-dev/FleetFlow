import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";

type StatCardProps = {
    title: string;
    value: number;
    description: string;
    to: string;
};

export const StatCard = ({ title, value, description, to }: StatCardProps) => {
    return (
        <Link
            to={to}
            className="group block min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-accent/40">
                <CardHeader className="min-w-0">
                    <CardDescription className="wrap-break-word">{title}</CardDescription>
                    <CardTitle className="text-2xl tabular-nums sm:text-3xl">{value}</CardTitle>
                </CardHeader>
                <CardContent className="min-w-0">
                    <p className="wrap-break-word text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                        {description}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
};
