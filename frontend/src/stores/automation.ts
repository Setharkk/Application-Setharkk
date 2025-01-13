import { defineStore } from 'pinia'
import axios from 'axios'
import type { AxiosResponse as AxiosRes } from '@types/axios'

interface Task {
  id: string
  status: string
}

interface BoostSpaceData {
  tasks: Task[]
  projects: any[]
}

interface AfforaiData {
  documents: any[]
  analyses: any[]
}

interface State {
  makeScenarios: any[]
  boostSpaceProjects: any[]
  boostSpaceTasks: Task[]
  afforaiDocuments: any[]
  afforaiAnalyses: any[]
}

export const useAutomationStore = defineStore('automation', {
  state: (): State => ({
    makeScenarios: [],
    boostSpaceProjects: [],
    boostSpaceTasks: [],
    afforaiDocuments: [],
    afforaiAnalyses: []
  }),

  actions: {
    async fetchMakeScenarios() {
      const response: AxiosRes<any[]> = await axios.get('/api/make/scenarios')
      this.makeScenarios = response.data
      return response.data
    },

    async fetchBoostSpaceData(): Promise<BoostSpaceData> {
      const [projectsResponse, tasksResponse]: [AxiosRes<any[]>, AxiosRes<Task[]>] = await Promise.all([
        axios.get('/api/boost-space/projects'),
        axios.get('/api/boost-space/tasks')
      ])
      this.boostSpaceProjects = projectsResponse.data
      this.boostSpaceTasks = tasksResponse.data
      return {
        projects: projectsResponse.data,
        tasks: tasksResponse.data
      }
    },

    async fetchAfforaiData(): Promise<AfforaiData> {
      const [documentsResponse, analysesResponse]: [AxiosRes<any[]>, AxiosRes<any[]>] = await Promise.all([
        axios.get('/api/afforai/documents'),
        axios.get('/api/afforai/analyses')
      ])
      this.afforaiDocuments = documentsResponse.data
      this.afforaiAnalyses = analysesResponse.data
      return {
        documents: documentsResponse.data,
        analyses: analysesResponse.data
      }
    }
  }
}) 