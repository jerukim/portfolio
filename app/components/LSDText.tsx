import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { random } from 'lodash-es'
import { randomElement, randomColor } from '~/lib/util'
import { fontFamily, textTransfrom } from '~/lib/constants'

function LSDChar({ children }: { children: string }) {
  const [style, setStyle] = useState({})

  useEffect(() => {
    const interval = setInterval(() => {
      setStyle({
        fontFamily: randomElement(fontFamily),
        fontSize: 48 + random(12) * (Math.random() < 0.5 ? -1 : 1),
        color: randomColor(),
        textTransform: randomElement(textTransfrom),
        textShadow: `${randomColor} ${random(5)}px ${random(
          5
        )}px ${random(5)}px`,
      })
    }, 300)
    return () => clearInterval(interval)
  }, [])

  return (
    <span
      className={clsx(
        'inline-block leading-none',
        children === ' ' && 'w-2'
      )}
      style={style}
    >
      {children}
    </span>
  )
}

export function LSDText({
  children,
  className,
}: {
  children: string
  className: string
}) {
  return (
    <h1 className={className + ' h-16 flex items-end'}>
      {children.split('').map((char, i) => (
        <LSDChar key={char + i}>{char}</LSDChar>
      ))}
    </h1>
  )
}
