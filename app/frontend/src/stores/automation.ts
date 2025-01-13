import { defineStore } from 'pinia'
import axios from 'axios'

interface State {
  makeScenarios: any[]
  boostSpaceProjects: any[]
  boostSpaceTasks: any[]
  afforaiDocuments: any[]
  afforaiAnalyses: any[]
  loading: boolean
}

export const useAutomationStore = defineStore('automation', {
  state: (): State => ({
    makeScenarios: [],
    boostSpaceProjects: [],
    boostSpaceTasks: [],
    afforaiDocuments: [],
    afforaiAnalyses: [],
    loading: false
  }),

  getters: {
    getActiveScenarios: (state) => state.makeScenarios.filter(s => s.isActive),
    getPendingTasks: (state) => state.boostSpaceTasks.filter(t => t.status === 'À faire'),
    getRecentAnalyses: (state) => state.afforaiAnalyses.slice(0, 5)
  },

  actions: {
    // Make.com Actions
    async fetchMakeScenarios() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_AUTOMATION_URL}/make/scenarios`)
        this.makeScenarios = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching Make scenarios:', error)
        throw error
      }
    },

    async executeMakeScenario(scenarioId: string) {
      try {
        await axios.post(`${import.meta.env.VITE_AUTOMATION_URL}/make/scenarios/${scenarioId}/execute`)
      } catch (error) {
        console.error('Error executing Make scenario:', error)
        throw error
      }
    },

    async toggleMakeScenario(scenarioId: string) {
      try {
        await axios.post(`${import.meta.env.VITE_AUTOMATION_URL}/make/scenarios/${scenarioId}/toggle`)
      } catch (error) {
        console.error('Error toggling Make scenario:', error)
        throw error
      }
    },

    async getMakeScenarioHistory(scenarioId: string) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_AUTOMATION_URL}/make/scenarios/${scenarioId}/history`)
        return response.data
      } catch (error) {
        console.error('Error fetching Make scenario history:', error)
        throw error
      }
    },

    async retryMakeExecution(executionId: string) {
      try {
        await axios.post(`${import.meta.env.VITE_AUTOMATION_URL}/make/executions/${executionId}/retry`)
      } catch (error) {
        console.error('Error retrying Make execution:', error)
        throw error
      }
    },

    async exportMakeHistory(history: any[]) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_AUTOMATION_URL}/make/history/export`,
          { history },
          { responseType: 'blob' }
        )
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'make-history.csv')
        document.body.appendChild(link)
        link.click()
        link.remove()
      } catch (error) {
        console.error('Error exporting Make history:', error)
        throw error
      }
    },

    // Boost.space Actions
    async fetchBoostSpaceData() {
      try {
        const [projectsResponse, tasksResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_AUTOMATION_URL}/boost-space/projects`),
          axios.get(`${import.meta.env.VITE_AUTOMATION_URL}/boost-space/tasks`)
        ])
        this.boostSpaceProjects = projectsResponse.data
        this.boostSpaceTasks = tasksResponse.data
        return {
          projects: projectsResponse.data,
          tasks: tasksResponse.data
        }
      } catch (error) {
        console.error('Error fetching Boost.space data:', error)
        throw error
      }
    },

    async createBoostSpaceProject(projectData: any) {
      try {
        await axios.post(`${import.meta.env.VITE_AUTOMATION_URL}/boost-space/projects`, projectData)
      } catch (error) {
        console.error('Error creating Boost.space project:', error)
        throw error
      }
    },

    async createBoostSpaceTask(taskData: any) {
      try {
        await axios.post(`${import.meta.env.VITE_AUTOMATION_URL}/boost-space/tasks`, taskData)
      } catch (error) {
        console.error('Error creating Boost.space task:', error)
        throw error
      }
    },

    async deleteBoostSpaceTask(taskId: string) {
      try {
        await axios.delete(`${import.meta.env.VITE_AUTOMATION_URL}/boost-space/tasks/${taskId}`)
      } catch (error) {
        console.error('Error deleting Boost.space task:', error)
        throw error
      }
    },

    // Afforai Actions
    async fetchAfforaiData() {
      try {
        const [documentsResponse, analysesResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_AUTOMATION_URL}/afforai/documents`),
          axios.get(`${import.meta.env.VITE_AUTOMATION_URL}/afforai/analyses`)
        ])
        this.afforaiDocuments = documentsResponse.data
        this.afforaiAnalyses = analysesResponse.data
        return {
          documents: documentsResponse.data,
          analyses: analysesResponse.data
        }
      } catch (error) {
        console.error('Error fetching Afforai data:', error)
        throw error
      }
    },

    async uploadAfforaiDocument(formData: FormData) {
      try {
        await axios.post(`${import.meta.env.VITE_AUTOMATION_URL}/afforai/documents`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      } catch (error) {
        console.error('Error uploading Afforai document:', error)
        throw error
      }
    },

    async analyzeAfforaiDocument(documentId: string) {
      try {
        await axios.post(`${import.meta.env.VITE_AUTOMATION_URL}/afforai/documents/${documentId}/analyze`)
      } catch (error) {
        console.error('Error analyzing Afforai document:', error)
        throw error
      }
    },

    async deleteAfforaiDocument(documentId: string) {
      try {
        await axios.delete(`${import.meta.env.VITE_AUTOMATION_URL}/afforai/documents/${documentId}`)
      } catch (error) {
        console.error('Error deleting Afforai document:', error)
        throw error
      }
    },

    async exportAfforaiAnalysis(analysisId: string) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_AUTOMATION_URL}/afforai/analyses/${analysisId}/export`,
          { responseType: 'blob' }
        )
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `analysis-${analysisId}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      } catch (error) {
        console.error('Error exporting Afforai analysis:', error)
        throw error
      }
    }
  }
}) 