import type { MetaFunction } from '@remix-run/node'
import { LSDText } from '~/components/LSDText'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export default function Index() {
  return (
    <div className=" flex flex-col items-center">
      <LSDText className="text-center my-4 drop-shadow">
        Jeru Kim
      </LSDText>
    </div>
  )
}
