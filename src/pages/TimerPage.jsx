import React from 'react';
import { Clock } from 'lucide-react';
import { Card } from '../components/ui/card';

const TimerPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-full">
                    <Clock className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Focus Timer</h1>
                    <p className="text-muted-foreground">Manage your study sessions and breaks</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 glass-panel">
                    <div className="text-center py-12">
                        <div className="text-6xl font-mono font-bold mb-8">25:00</div>
                        <div className="flex justify-center space-x-4">
                            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors">
                                Start
                            </button>
                            <button className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors">
                                Reset
                            </button>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 glass-panel">
                    <h3 className="text-xl font-heading font-semibold mb-4">Session History</h3>
                    <div className="space-y-4">
                        <p className="text-muted-foreground text-sm">No sessions recorded today.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TimerPage;
