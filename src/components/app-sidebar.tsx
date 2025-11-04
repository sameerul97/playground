import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Camera Look At",
    url: "/playground/camera-look-at",
  },
  {
    title: "Scene Background",
    url: "/playground/background",
  },
  {
    title: "Clouds",
    url: "/playground/clouds",
  },
  {
    title: "Faded Plane",
    url: "/playground/faded-plane",
  },
  {
    title: "Mouse Bulge effect",
    url: "/playground/bulge-effect",
  },
  {
    title: "Image ripple",
    url: "/playground/image-ripple",
  },
  {
    title: "Sticker ball",
    url: "/playground/sticker-ball",
  },
  {
    title: "Car",
    url: "/playground/car",
  },
  {
    title: "Car v2",
    url: "/playground/carv2",
  },
  {
    title: "Sunset Car",
    url: "/playground/sunset-car",
  },
  {
    title: "ST",
    url: "/playground/st",
  },
  {
    title: "Ground Projection",
    url: "/playground/ground-projection",
  },
]

export function AppSidebar() {
  return (
    <Sidebar variant="floating">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Demos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
