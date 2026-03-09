import ObservatoryLayoutClient from './ObservatoryLayoutClient'

export default function ObservatoryLayout({ children }:{ children: React.ReactNode }) {
  return <ObservatoryLayoutClient>{children}</ObservatoryLayoutClient>
}
