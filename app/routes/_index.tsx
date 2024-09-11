import type { MetaFunction } from '@remix-run/node'
import { GraphMouseWarp } from '~/components/GraphMouseWarp'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export default function Index() {
  return <GraphMouseWarp />
}
