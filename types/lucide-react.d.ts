declare module 'lucide-react' {
  import * as React from 'react'

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number
    absoluteStrokeWidth?: boolean
  }

  export type LucideIcon = React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >

  // Export all common icons used in the project
  export const CheckIcon: LucideIcon
  export const ChevronDownIcon: LucideIcon
  export const ChevronUpIcon: LucideIcon
  export const Calendar: LucideIcon
  export const Clock: LucideIcon
  export const CheckCircle2: LucideIcon
  export const TrendingUp: LucideIcon
  export const User: LucideIcon
  export const UserIcon: LucideIcon
  export const Users: LucideIcon
  export const LogOut: LucideIcon
  export const Building2: LucideIcon
  export const FileCheck: LucideIcon
  export const AlertCircle: LucideIcon
  export const Loader2: LucideIcon
  export const Bell: LucideIcon
  export const ChevronsUpDown: LucideIcon
  export const Search: LucideIcon
  export const X: LucideIcon
  export const ChevronLeft: LucideIcon
  export const ChevronRight: LucideIcon
  export const Check: LucideIcon
  export const ArrowLeft: LucideIcon
  export const ArrowRight: LucideIcon
  export const MoreHorizontal: LucideIcon
  export const CircleIcon: LucideIcon
  export const ChevronRightIcon: LucideIcon
  export const MinusIcon: LucideIcon
  export const Loader2Icon: LucideIcon
  export const PanelLeftIcon: LucideIcon
  export const XIcon: LucideIcon
  export const GripVerticalIcon: LucideIcon
  export const SearchIcon: LucideIcon
  export const MessageCircle: LucideIcon
  export const ChevronDown: LucideIcon
  export const Settings: LucideIcon
  export const Trash2: LucideIcon
  export const ExternalLink: LucideIcon
  export const RefreshCw: LucideIcon
  export const XCircle: LucideIcon

  // Additional icons
  export const Settings: LucideIcon
  export const Trash2: LucideIcon
  export const ExternalLink: LucideIcon
  export const RefreshCw: LucideIcon
  export const XCircle: LucideIcon

  // Allow dynamic icon imports - this helps TypeScript accept any icon name
  const createLucideIcon: (name: string) => LucideIcon
  export { createLucideIcon }

  // Re-export all icons from lucide-react to avoid type conflicts
  export * from 'lucide-react'
}

