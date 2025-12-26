import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Palette, Upload, X, Image as ImageIcon, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';

const AppearanceSection = ({ profile, updateProfile }) => {
    const [backgroundImage, setBackgroundImage] = useState('');
    const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        if (profile) {
            if (profile.background_image) {
                setBackgroundImage(profile.background_image);
                setPreviewUrl(profile.background_image);
            } else {
                setBackgroundImage('');
                setPreviewUrl(null);
            }
        }
    }, [profile]);

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        
        if (!file) return;

        if (!profile || !profile.id) {
            toast.error('You must be logged in to upload images');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setIsUploading(true);
        try {
            // Upload to Supabase Storage
            // Use 'avatars' bucket or create a 'backgrounds' bucket
            // For now, we'll use the avatars bucket with a different path
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.id}/background-${Date.now()}.${fileExt}`;
            const filePath = `backgrounds/${fileName}`;

            // Try to upload to a 'backgrounds' bucket, fallback to 'avatars' if it doesn't exist
            let uploadError = null;
            let publicUrl = null;

            // Try backgrounds bucket first
            const { data: uploadData, error: uploadErr } = await supabase.storage
                .from('backgrounds')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadErr) {
                
                // If backgrounds bucket doesn't exist, try avatars bucket
                const { data: avatarUploadData, error: avatarUploadErr } = await supabase.storage
                    .from('avatars')
                    .upload(`backgrounds/${fileName}`, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (avatarUploadErr) {
                    uploadError = avatarUploadErr;
                } else {
                    // Get public URL from avatars bucket
                    const { data: urlData } = supabase.storage
                        .from('avatars')
                        .getPublicUrl(`backgrounds/${fileName}`);
                    publicUrl = urlData.publicUrl;
                }
            } else {
                // Get public URL from backgrounds bucket
                const { data: urlData } = supabase.storage
                    .from('backgrounds')
                    .getPublicUrl(filePath);
                publicUrl = urlData.publicUrl;
            }

            if (uploadError) {
                throw uploadError;
            }

            if (!publicUrl) {
                throw new Error('Failed to get image URL');
            }

            // Update profile with new background image URL
            console.log('📸 SettingsPage: Updating profile with background image URL:', publicUrl);
            const { error: updateError, data: updatedProfile } = await updateProfile({
                background_image: publicUrl,
                updated_at: new Date().toISOString()
            });

            if (updateError) throw updateError;

            console.log('✅ SettingsPage: Profile updated successfully:', updatedProfile);
            setBackgroundImage(publicUrl);
            setPreviewUrl(publicUrl);
            toast.success('Background image uploaded successfully');
        } catch (error) {
            console.error('Error uploading background image:', error);
            toast.error(error?.message || 'Failed to upload background image');
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleUrlChange = (e) => {
        const url = e.target.value;
        setBackgroundImageUrl(url);
        if (url && isValidUrl(url)) {
            setPreviewUrl(url);
        }
    };

    const handleSaveUrl = async () => {
        if (!profile || !profile.id) {
            toast.error('You must be logged in to update your background image');
            return;
        }

        if (!backgroundImageUrl.trim()) {
            toast.error('Please enter a valid image URL');
            return;
        }

        if (!isValidUrl(backgroundImageUrl)) {
            toast.error('Please enter a valid URL');
            return;
        }

        setIsUploading(true);
        try {
            const urlToSave = backgroundImageUrl.trim();
            console.log('📸 SettingsPage: Updating profile with background image URL:', urlToSave);
            const { error, data: updatedProfile } = await updateProfile({
                background_image: urlToSave,
                updated_at: new Date().toISOString()
            });

            if (error) throw error;

            console.log('✅ SettingsPage: Profile updated successfully:', updatedProfile);
            setBackgroundImage(urlToSave);
            setPreviewUrl(urlToSave);
            setBackgroundImageUrl('');
            toast.success('Background image updated successfully');
        } catch (error) {
            console.error('Error updating background image:', error);
            toast.error(error?.message || 'Failed to update background image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveBackground = async () => {
        if (!profile || !profile.id) {
            toast.error('You must be logged in to remove your background image');
            return;
        }

        setIsUploading(true);
        try {
            const { error } = await updateProfile({
                background_image: null,
                updated_at: new Date().toISOString()
            });

            if (error) throw error;

            setBackgroundImage('');
            setPreviewUrl(null);
            setBackgroundImageUrl('');
            toast.success('Background image removed');
        } catch (error) {
            console.error('Error removing background image:', error);
            toast.error(error?.message || 'Failed to remove background image');
        } finally {
            setIsUploading(false);
        }
    };

    const isValidUrl = (string) => {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    };

    if (!profile) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Appearance</h3>
                    <p className="text-sm text-muted-foreground">
                        Please log in to customize your appearance settings.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Appearance</h3>
                <p className="text-sm text-muted-foreground">
                    Customize the look and feel of your experience.
                </p>
            </div>
            <Separator />
            <div className="space-y-6">
                {/* Color Theme Section */}
                <div>
                    <Label>Color Theme</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                        Choose your preferred color palette. You can also change this from the header palette icon.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Use the color palette dropdown in the header to switch themes.
                    </p>
                </div>

                <Separator />

                {/* Background Image Section */}
                <div>
                    <Label>Background Image</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                        Upload a custom background image or enter an image URL. This will appear in your profile header.
                    </p>

                    {/* Current Background Preview */}
                    {previewUrl && (
                        <div className="mb-4">
                            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                <img
                                    src={previewUrl}
                                    alt="Background preview"
                                    className="w-full h-full object-cover"
                                    onError={() => {
                                        setPreviewUrl(null);
                                        toast.error('Failed to load image. Please check the URL.');
                                    }}
                                />
                                <button
                                    onClick={handleRemoveBackground}
                                    disabled={isUploading}
                                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50"
                                    title="Remove background image"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* File Upload */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="background-upload">Upload Image</Label>
                            <div className="mt-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="background-upload"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="w-full sm:w-auto"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {isUploading ? 'Uploading...' : 'Choose File'}
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>

                        {/* URL Input */}
                        <div>
                            <Label htmlFor="background-url">Image URL</Label>
                            <div className="mt-2 flex gap-2">
                                <Input
                                    id="background-url"
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={backgroundImageUrl}
                                    onChange={handleUrlChange}
                                    disabled={isUploading}
                                />
                                <Button
                                    onClick={handleSaveUrl}
                                    disabled={isUploading || !backgroundImageUrl.trim()}
                                >
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    Save URL
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SubscriptionSection = ({ profile }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    const handleManageSubscription = async () => {
        if (!user?.id) {
            toast.error('You must be logged in to manage your subscription.');
            return;
        }

        if (!profile?.stripe_customer_id) {
            toast.error('No subscription found. Please subscribe first.');
            navigate('/pricing');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/create-portal-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    userId: user.id
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to create portal session');
            }

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            } else {
                throw new Error('No portal URL returned');
            }
        } catch (error) {
            console.error('Error creating portal session:', error);
            toast.error(error?.message || 'Failed to open subscription management. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getSubscriptionStatus = () => {
        if (!profile) return 'Unknown';
        const role = profile.role || 'Free';
        const subscriptionStatus = profile.subscription_status;
        
        if (role === 'Free' || !subscriptionStatus) {
            return 'Free';
        }
        
        return subscriptionStatus === 'active' ? 'Active' : subscriptionStatus || 'Free';
    };

    const getPlanName = () => {
        const role = profile?.role || 'Free';
        if (role === 'Student') return 'Student Plan';
        if (role === 'Teacher') return 'Teacher Plan';
        return 'Free Plan';
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Subscription Management</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your subscription, billing, and payment methods.
                </p>
            </div>
            <Separator />
            <div className="space-y-6">
                {/* Current Subscription Status */}
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <Label className="text-base font-semibold">Current Plan</Label>
                            <p className="text-sm text-muted-foreground mt-1">
                                {getPlanName()}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                getSubscriptionStatus() === 'Active' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                            }`}>
                                {getSubscriptionStatus()}
                            </div>
                        </div>
                    </div>
                    
                    {profile?.subscription_id && (
                        <div className="text-xs text-muted-foreground mt-2">
                            Subscription ID: {profile.subscription_id}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    {profile?.stripe_customer_id ? (
                        <Button 
                            onClick={handleManageSubscription}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Opening...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Manage Subscription
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button 
                            onClick={() => navigate('/pricing')}
                            className="w-full"
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Subscribe to a Plan
                        </Button>
                    )}

                    <Button 
                        variant="outline"
                        onClick={() => navigate('/pricing')}
                        className="w-full"
                    >
                        View Plans & Pricing
                    </Button>
                </div>

                {/* Information */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                        <strong>Need help?</strong> Use the "Manage Subscription" button to access the Stripe Customer Portal where you can:
                    </p>
                    <ul className="text-sm text-blue-800 dark:text-blue-300 mt-2 ml-4 list-disc space-y-1">
                        <li>Update payment methods</li>
                        <li>View billing history</li>
                        <li>Cancel or modify your subscription</li>
                        <li>Download invoices</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

const SettingsPage = () => {
    const { user, profile, updateProfile, loading } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('account');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.full_name || '');
            setEmail(profile.email || '');
        }
    }, [profile]);

    // Show loading state while auth is being checked
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading settings...</p>
                </div>
            </div>
        );
    }

    // Show message if user is not logged in
    if (!user || !profile) {
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
                <Card className="p-6 glass-panel">
                    <div className="text-center py-12">
                        <p className="text-lg text-muted-foreground mb-4">
                            You must be logged in to access settings.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Please log in to continue.
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    const handleSaveProfile = async () => {
        if (!profile) {
            toast.error('You must be logged in to save changes');
            return;
        }

        if (!displayName.trim()) {
            toast.error('Display name cannot be empty');
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await updateProfile({
                full_name: displayName.trim(),
                updated_at: new Date().toISOString()
            });

            if (error) throw error;

            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'account':
                return (
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
                                <Input 
                                    id="name" 
                                    placeholder="Your name" 
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="Your email" 
                                    value={email}
                                    disabled
                                    className="opacity-50 cursor-not-allowed"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Email cannot be changed here. Contact support to change your email.
                                </p>
                            </div>
                            <Button onClick={handleSaveProfile} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium">Notification Preferences</h3>
                            <p className="text-sm text-muted-foreground">
                                Manage how you receive notifications.
                            </p>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive email updates about your progress
                                    </p>
                                </div>
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive push notifications in your browser
                                    </p>
                                </div>
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Course Updates</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get notified when new courses are available
                                    </p>
                                </div>
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" defaultChecked />
                            </div>
                            <Button onClick={() => toast.success('Notification preferences saved')}>
                                Save Preferences
                            </Button>
                        </div>
                    </div>
                );
            case 'appearance':
                return (
                    <AppearanceSection 
                        profile={profile} 
                        updateProfile={updateProfile}
                    />
                );
            case 'privacy':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium">Privacy Settings</h3>
                            <p className="text-sm text-muted-foreground">
                                Manage your privacy and data preferences.
                            </p>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Public Profile</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow others to view your profile
                                    </p>
                                </div>
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Show Progress</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Display your learning progress publicly
                                    </p>
                                </div>
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" defaultChecked />
                            </div>
                            <Button onClick={() => toast.success('Privacy settings saved')}>
                                Save Privacy Settings
                            </Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

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
                        <Button 
                            variant="ghost" 
                            className={`w-full justify-start ${activeSection === 'account' ? 'bg-primary/10' : ''}`}
                            onClick={() => setActiveSection('account')}
                        >
                            <User className="mr-2 h-4 w-4" />
                            Account
                        </Button>
                        <Button 
                            variant="ghost" 
                            className={`w-full justify-start ${activeSection === 'notifications' ? 'bg-primary/10' : ''}`}
                            onClick={() => setActiveSection('notifications')}
                        >
                            <Bell className="mr-2 h-4 w-4" />
                            Notifications
                        </Button>
                        <Button 
                            variant="ghost" 
                            className={`w-full justify-start ${activeSection === 'appearance' ? 'bg-primary/10' : ''}`}
                            onClick={() => setActiveSection('appearance')}
                        >
                            <Palette className="mr-2 h-4 w-4" />
                            Appearance
                        </Button>
                        <Button 
                            variant="ghost" 
                            className={`w-full justify-start ${activeSection === 'privacy' ? 'bg-primary/10' : ''}`}
                            onClick={() => setActiveSection('privacy')}
                        >
                            <Shield className="mr-2 h-4 w-4" />
                            Privacy
                        </Button>
                        <Button 
                            variant="ghost" 
                            className={`w-full justify-start ${activeSection === 'subscription' ? 'bg-primary/10' : ''}`}
                            onClick={() => setActiveSection('subscription')}
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Subscription
                        </Button>
                    </nav>
                </Card>

                {/* Main Content */}
                <Card className="p-6 glass-panel lg:col-span-3">
                    {renderContent()}
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;
