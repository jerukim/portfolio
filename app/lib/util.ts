import { random } from 'lodash-es'
import { hex } from './constants'

export function randomElement(arr: any[]) {
  return arr[random(arr.length)]
}

export function randomColor() {
  return `#${hex[random(hex.length)]}${hex[random(hex.length)]}${
    hex[random(hex.length)]
  }`
}
