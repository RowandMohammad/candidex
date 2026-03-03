'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Settings, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AppSidebarProps {
    user: {
        email: string;
        displayName: string;
    };
}

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/cv', label: 'Master CV', icon: FileText },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar({ user }: AppSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900">
            {/* Logo */}
            <div className="flex h-16 items-center px-6">
                <Link href="/dashboard" className="text-xl font-bold text-white">
                    🎯 Candidex
                </Link>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${isActive
                                    ? 'bg-zinc-800 text-white'
                                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                                }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <Separator className="bg-zinc-800" />

            {/* User info + logout */}
            <div className="p-4">
                <div className="mb-3">
                    <p className="truncate text-sm font-medium text-white">
                        {user.displayName}
                    </p>
                    <p className="truncate text-xs text-zinc-500">{user.email}</p>
                </div>
                <form action="/auth/logout" method="POST">
                    <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-zinc-400 hover:text-red-400"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </form>
            </div>
        </aside>
    );
}
