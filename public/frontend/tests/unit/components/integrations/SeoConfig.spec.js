import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import SeoConfig from '@/views/integrations/SeoConfig.vue'

describe('SeoConfig.vue', () => {
  let store
  let wrapper

  beforeEach(() => {
    store = createStore({
      modules: {
        integrations: {
          namespaced: true,
          state: {},
          getters: {
            isIntegrationEnabled: () => () => false
          },
          actions: {
            configureIntegration: jest.fn()
          }
        },
        error: {
          namespaced: true,
          actions: {
            addNotification: jest.fn()
          }
        }
      }
    })

    wrapper = mount(SeoConfig, {
      global: {
        plugins: [store]
      }
    })
  })

  it('affiche le titre correct', () => {
    expect(wrapper.find('h1').text()).toBe('Configuration SEO')
  })

  it('affiche le formulaire de configuration', () => {
    expect(wrapper.find('#analysisType').exists()).toBe(true)
    expect(wrapper.find('#timeout').exists()).toBe(true)
    expect(wrapper.find('#maxRetries').exists()).toBe(true)
  })

  it('affiche la liste des fonctionnalités', () => {
    const features = wrapper.findAll('.feature-card')
    expect(features.length).toBe(4)
  })

  it('met à jour les paramètres lors de la modification', async () => {
    const select = wrapper.find('#analysisType')
    await select.setValue('detailed')
    expect(wrapper.vm.settings.analysisType).toBe('detailed')
  })

  it('active/désactive une fonctionnalité', async () => {
    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setChecked(true)
    expect(wrapper.vm.features[0].enabled).toBe(true)
  })

  it('sauvegarde la configuration', async () => {
    const saveButton = wrapper.find('.btn.primary')
    await saveButton.trigger('click')
    expect(store.state.integrations.configureIntegration).toHaveBeenCalled()
  })

  it('réinitialise la configuration', async () => {
    const resetButton = wrapper.find('.btn.danger')
    await resetButton.trigger('click')
    expect(wrapper.vm.settings.analysisType).toBe('basic')
    expect(wrapper.vm.features.every(f => !f.enabled)).toBe(true)
  })
}) 