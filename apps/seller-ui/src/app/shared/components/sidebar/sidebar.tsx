'use client';
import React, { useEffect } from 'react';
import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import useSidebar from 'apps/seller-ui/src/hooks/useSidebar';
import { usePathname } from 'next/navigation';
import Box from '../box';
import { Sidebar } from './sidebar.styles';
import Link from 'next/link';
import Logo from 'apps/seller-ui/src/assets/svgs/logo';
import SidebarItem from './sidebar.item';
import {
  House,
  ListOrdered,
  CreditCardIcon,
  SquarePlus,
  CalendarPlus,
  Bell,
  Settings,
  TicketPercent,
  LogOut,
} from 'lucide-react';
import SidebarMenu from './sidebar.menu';

function SidebarWrapper() {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { seller } = useSeller();

  console.log(seller);

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? '#0085ff' : '#969696';

  return (
    <Box
      css={{
        height: '100vh',
        zIndex: 202,
        position: 'sticky',
        padding: '8px',
        top: '0',
        overflowY: 'scroll',
        scrollbarWidth: 'none',
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link href={'/'} className="flex justify-center text-center gap-2">
            <Logo />
            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">
                {seller?.shop?.name}
              </h3>
              <h5 className="font-medium text-xs text-[#ecdeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[70px]">
                {seller?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>

      <div className="block my-3 h-full">
        <Sidebar.Body>
          <SidebarItem
            title="Dashbaord"
            icon={
              <House
                color={getIconColor('/dashboard')}
                //fill={getIconColor('/dashboard')}
              />
            }
            isActive={activeSidebar === 'dashboard'}
            href="/dashboard"
          />

          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                title="Order"
                icon={
                  <ListOrdered
                    color={getIconColor('/dashboard/order')}
                    //fill={getIconColor('/order')}
                  />
                }
                isActive={activeSidebar === '/dashboard/order'}
                href="/dashboard/order"
              />

              <SidebarItem
                title="Payments"
                icon={
                  <CreditCardIcon
                    color={getIconColor('/dashboard/payments')}
                    //fill={getIconColor('/payments')}
                  />
                }
                isActive={activeSidebar === '/dashboard/payments'}
                href="/dashboard/payments"
              />
            </SidebarMenu>

            <SidebarMenu title="Products">
              <SidebarItem
                title="Create Product"
                icon={
                  <SquarePlus
                    color={getIconColor('/dashboard/create-product')}
                    //fill={getIconColor('/payments')}
                  />
                }
                isActive={activeSidebar === '/dashboard/create-product'}
                href="/dashboard/create-product"
              />
              <SidebarItem
                title="All Product"
                icon={
                  <SquarePlus
                    color={getIconColor('/dashboard/all-product')}
                    //fill={getIconColor('/payments')}
                  />
                }
                isActive={activeSidebar === '/dashboard/all-product'}
                href="/dashboard/all-product"
              />
            </SidebarMenu>

            <SidebarMenu title="Events">
              <SidebarItem
                title="Create Event"
                icon={
                  <CalendarPlus
                    color={getIconColor('/dashboard/create-event')}
                    //fill={getIconColor('/payments')}
                  />
                }
                isActive={activeSidebar === '/dashboard/create-event'}
                href="/dashboard/create-event"
              />

              <SidebarItem
                title="All Events"
                icon={
                  <CalendarPlus
                    color={getIconColor('/dashboard/all-events')}
                    //fill={getIconColor('/payments')}
                  />
                }
                isActive={activeSidebar === '/dashboard/all-events'}
                href="/dashboard/all-events"
              />
            </SidebarMenu>

            <SidebarMenu title="Controllers">
              <SidebarItem
                title="Inbox"
                icon={
                  <CalendarPlus
                    color={getIconColor('/dashboard/inbox')}
                    //fill={getIconColor('/payments')}
                  />
                }
                isActive={activeSidebar === '/dashboard/inbox'}
                href="/dashboard/inbox"
              />
              <SidebarItem
                title="Settings"
                icon={
                  <Settings
                    color={getIconColor('/dashboard/settings')}
                    //fill={getIconColor('/payments')}
                  />
                }
                isActive={activeSidebar === '/dashboard/settings'}
                href="/dashboard/settings"
              />
              <SidebarItem
                title="Notifications"
                icon={
                  <Bell
                    color={getIconColor('/dashboard/notifications')}
                    //fill={getIconColor('/payments')}
                  />
                }
                isActive={activeSidebar === '/dashboard/notifications'}
                href="/dashboard/notifications"
              />
            </SidebarMenu>

            <SidebarMenu title="Extras">
              <SidebarItem
                title="Discount Codes"
                icon={
                  <TicketPercent
                    color={getIconColor('/dashboard/discount-codes')}
                    //fill={getIconColor('/payments')}
                  />
                }
                isActive={activeSidebar === '/dashboard/discount-codes'}
                href="/dashboard/discount-codes"
              />

              <SidebarItem
                title="Logout"
                icon={
                  <LogOut
                    color={getIconColor('/logout')}
                    //fill={getIconColor('/payments')}
                  />
                }
                isActive={activeSidebar === '/logout'}
                href="/logout"
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
}

export default SidebarWrapper;
