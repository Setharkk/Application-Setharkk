import { mount } from '@vue/test-utils'
import Button from '@/components/common/Button.vue'

describe('Button.vue', () => {
  it('rend le texte du bouton correctement', () => {
    const text = 'Cliquez-moi'
    const wrapper = mount(Button, {
      props: {
        text: text
      }
    })
    expect(wrapper.text()).toMatch(text)
  })

  it('émet un événement click quand cliqué', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
  })

  it('applique la classe disabled quand désactivé', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      }
    })
    expect(wrapper.classes()).toContain('disabled')
  })
}) 