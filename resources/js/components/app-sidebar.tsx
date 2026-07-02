import { Link, usePage } from '@inertiajs/react';
import {
    Factory,
    FlaskConical,
    GraduationCap,
    LayoutGrid,
    Settings2,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as productsIndex } from '@/routes/admin/products';
import { index as adminTrainingIndex } from '@/routes/admin/training';
import { index as productionIndex } from '@/routes/production';
import { index as trainingIndex } from '@/routes/training';
import type { Auth, NavItem } from '@/types';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;

    const mainNavItems: NavItem[] = [
        ...(auth.user.is_admin
            ? [
                  {
                      title: 'Dashboard',
                      href: dashboard(),
                      icon: LayoutGrid,
                  },
              ]
            : []),
        ...(auth.user.is_admin || auth.user.training_passed_at
            ? [
                  {
                      title: 'Productie',
                      href: productionIndex(),
                      icon: Factory,
                  },
              ]
            : []),
        ...(!auth.user.is_admin
            ? [
                  {
                      title: auth.user.training_passed_at
                          ? 'Training ✓'
                          : 'Training',
                      href: trainingIndex(),
                      icon: GraduationCap,
                  },
              ]
            : []),
        ...(auth.user.is_admin
            ? [
                  {
                      title: 'Product Beheer',
                      href: productsIndex(),
                      icon: FlaskConical,
                  },
                  {
                      title: 'Training Beheer',
                      href: adminTrainingIndex(),
                      icon: Settings2,
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={
                                    auth.user.is_admin
                                        ? dashboard()
                                        : productionIndex()
                                }
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
