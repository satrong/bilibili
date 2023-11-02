import {
  defineComponent, h, type Component, shallowRef
  , triggerRef, getCurrentInstance, DefineComponent
} from 'vue'
import { ElDialog } from 'element-plus'

type IConstructor = new (...args: any[]) => any

interface Options<T extends IConstructor = DefineComponent> {
  title: string
  component: T
  props?: InstanceType<T>['$props']
}

let count = 0

export const modalList = shallowRef<Component[]>([]);

export function useModal<T extends IConstructor>(options: Options<T>) {
  const name = '__modal__' + count++
  const cmp = defineComponent({
    name,
    setup() {
      return () => h(ElDialog, {
        modelValue: true,
        title: options.title,
        onClosed() {
          // 避免不是调用 useCloseModal 关闭的情况
          closeModal(name)
        }
      }, {
        default: () => h(options.component, options.props)
      })
    }
  })

  modalList.value.push(cmp)
  triggerRef(modalList)

}

function closeModal(name?: string) {
  if (name) {
    modalList.value = modalList.value.filter(cmp => cmp.name !== name)
    triggerRef(modalList)
  }
}

export function useCloseModal() {
  const instance = getCurrentInstance()?.proxy
  return () => {
    if (instance) {
      let p = instance.$parent
      while (p) {
        if (p.$options.name?.startsWith('__modal__')) {
          break
        }
        p = p.$parent
      }
      p && closeModal(p.$options.name)
    }
  }
}
