import React from 'react';
import { Settings, User, Bell, Shield, Palette } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';

const SettingsPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-full">
                    <Settings className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground">Manage your account preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <Card className="p-4 glass-panel h-fit lg:col-span-1">
                    <nav className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start">
                            <User className="mr-2 h-4 w-4" />
                            Account
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                            <Bell className="mr-2 h-4 w-4" />
                            Notifications
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                            <Palette className="mr-2 h-4 w-4" />
                            Appearance
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                            <Shield className="mr-2 h-4 w-4" />
                            Privacy
                        </Button>
                    </nav>
                </Card>

                {/* Main Content */}
                <Card className="p-6 glass-panel lg:col-span-3">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium">Profile Information</h3>
                            <p className="text-sm text-muted-foreground">
                                Update your account's profile information and email address.
                            </p>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input id="name" placeholder="Your name" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="Your email" />
                            </div>
                            <Button>Save Changes</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;
