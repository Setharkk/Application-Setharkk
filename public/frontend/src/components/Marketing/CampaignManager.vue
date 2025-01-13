<template>
  <div>
    <!-- SEO Meta Tags -->
    <vue-meta>
      <template v-slot:title>{{ campaign.title }} | Gestion des Campagnes Marketing</template>
      <template v-slot:meta>
        <meta name="description" :content="campaign.description">
        <meta property="og:title" :content="campaign.title">
        <meta property="og:description" :content="campaign.description">
        <meta property="og:type" content="website">
        <meta name="twitter:card" content="summary_large_image">
      </template>
    </vue-meta>

    <v-container>
      <!-- En-tête -->
      <v-row class="mb-4">
        <v-col cols="8">
          <h2 class="text-h4">Gestion des Campagnes</h2>
        </v-col>
        <v-col cols="4" class="text-right">
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openCampaignDialog()"
          >
            Nouvelle campagne
          </v-btn>
        </v-col>
      </v-row>

      <!-- Filtres -->
      <v-row class="mb-4">
        <v-col cols="12" sm="4">
          <v-select
            v-model="filters.status"
            :items="statusOptions"
            label="Statut"
            clearable
            @update:model-value="fetchCampaigns"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-select
            v-model="filters.type"
            :items="typeOptions"
            label="Type"
            clearable
            @update:model-value="fetchCampaigns"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="filters.search"
            label="Rechercher"
            prepend-icon="mdi-magnify"
            clearable
            @update:model-value="fetchCampaigns"
          />
        </v-col>
      </v-row>

      <!-- Liste des campagnes -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-data-table
              :headers="headers"
              :items="campaigns"
              :loading="loading"
              :items-per-page="10"
            >
              <!-- Statut -->
              <template #[`item.status`]>
                <v-chip
                  :color="getStatusColor(item.raw.status)"
                  size="small"
                >
                  {{ item.raw.status }}
                </v-chip>
              </template>

              <!-- Budget -->
              <template #[`item.budget`]>
                {{ formatCurrency(item.raw.budget) }}
              </template>

              <!-- ROI -->
              <template #[`item.roi`]>
                <span :class="getRoiColor(item.raw.roi)">
                  {{ formatPercentage(item.raw.roi) }}
                </span>
              </template>

              <!-- Actions -->
              <template #[`item.actions`]>
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  size="small"
                  @click="openCampaignDialog(item.raw)"
                />
                <v-btn
                  icon="mdi-chart-line"
                  variant="text"
                  size="small"
                  @click="viewAnalytics(item.raw)"
                />
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  @click="confirmDelete(item.raw)"
                />
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- Dialog de création/édition -->
      <v-dialog
        v-model="dialog"
        max-width="800px"
      >
        <v-card>
          <v-card-title>
            {{ editedCampaign.id ? 'Modifier la campagne' : 'Nouvelle campagne' }}
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="saveCampaign" ref="form">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="editedCampaign.name"
                    label="Nom de la campagne"
                    :rules="[v => !!v || 'Le nom est requis']"
                    required
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-select
                    v-model="editedCampaign.type"
                    :items="typeOptions"
                    label="Type"
                    required
                    :rules="[v => !!v || 'Le type est requis']"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="editedCampaign.budget"
                    label="Budget"
                    type="number"
                    prefix="€"
                    :rules="[
                      v => !!v || 'Le budget est requis',
                      v => v > 0 || 'Le budget doit être positif'
                    ]"
                    required
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="editedCampaign.description"
                    label="Description"
                    rows="3"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-menu
                    ref="startMenu"
                    v-model="startMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="editedCampaign.start_date"
                        label="Date de début"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="props"
                        :rules="[v => !!v || 'La date de début est requise']"
                      />
                    </template>
                    <v-date-picker
                      v-model="editedCampaign.start_date"
                      @input="startMenu = false"
                    />
                  </v-menu>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-menu
                    ref="endMenu"
                    v-model="endMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="editedCampaign.end_date"
                        label="Date de fin"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="props"
                        :rules="[
                          v => !!v || 'La date de fin est requise',
                          v => !editedCampaign.start_date || v >= editedCampaign.start_date || 'La date de fin doit être après la date de début'
                        ]"
                      />
                    </template>
                    <v-date-picker
                      v-model="editedCampaign.end_date"
                      @input="endMenu = false"
                    />
                  </v-menu>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="grey"
              variant="text"
              @click="dialog = false"
            >
              Annuler
            </v-btn>
            <v-btn
              color="primary"
              @click="saveCampaign"
              :loading="loading"
            >
              {{ editedCampaign.id ? 'Modifier' : 'Créer' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog de confirmation de suppression -->
      <v-dialog
        v-model="deleteDialog"
        max-width="400px"
      >
        <v-card>
          <v-card-title>Confirmer la suppression</v-card-title>
          <v-card-text>
            Êtes-vous sûr de vouloir supprimer cette campagne ?
            Cette action est irréversible.
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="grey"
              variant="text"
              @click="deleteDialog = false"
            >
              Annuler
            </v-btn>
            <v-btn
              color="error"
              @click="deleteCampaign"
              :loading="loading"
            >
              Supprimer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();
const form = ref(null);

// État local
const dialog = ref(false);
const deleteDialog = ref(false);
const startMenu = ref(false);
const endMenu = ref(false);
const filters = ref({
  status: null,
  type: null,
  search: ''
});

const editedCampaign = ref({
  name: '',
  type: '',
  budget: 0,
  description: '',
  start_date: null,
  end_date: null
});

const campaignToDelete = ref(null);

// Données du store
const campaigns = computed(() => store.getters['marketing/campaigns/getCampaigns']);
const loading = computed(() => store.getters['marketing/campaigns/isLoading']);
const error = computed(() => store.getters['marketing/campaigns/getError']);

// Options et configuration
const headers = [
  { title: 'Nom', key: 'name' },
  { title: 'Type', key: 'type' },
  { title: 'Statut', key: 'status' },
  { title: 'Budget', key: 'budget' },
  { title: 'ROI', key: 'roi' },
  { title: 'Actions', key: 'actions', sortable: false }
];

const statusOptions = [
  { title: 'Active', value: 'active' },
  { title: 'En pause', value: 'paused' },
  { title: 'Terminée', value: 'ended' },
  { title: 'Planifiée', value: 'scheduled' }
];

const typeOptions = [
  { title: 'Email', value: 'email' },
  { title: 'Social Media', value: 'social' },
  { title: 'Display', value: 'display' },
  { title: 'Search', value: 'search' }
];

// Méthodes
const fetchCampaigns = async () => {
  await store.dispatch('marketing/campaigns/fetchCampaigns', filters.value);
};

const openCampaignDialog = (campaign = null) => {
  if (campaign) {
    editedCampaign.value = { ...campaign };
  } else {
    editedCampaign.value = {
      name: '',
      type: '',
      budget: 0,
      description: '',
      start_date: null,
      end_date: null
    };
  }
  dialog.value = true;
};

const saveCampaign = async () => {
  if (!form.value.validate()) return;

  try {
    if (editedCampaign.value.id) {
      await store.dispatch('marketing/campaigns/updateCampaign', {
        id: editedCampaign.value.id,
        data: editedCampaign.value
      });
    } else {
      await store.dispatch('marketing/campaigns/createCampaign', editedCampaign.value);
    }
    dialog.value = false;
    await fetchCampaigns();
  } catch (error) {
    console.error('Error saving campaign:', error);
  }
};

const confirmDelete = (campaign) => {
  campaignToDelete.value = campaign;
  deleteDialog.value = true;
};

const deleteCampaign = async () => {
  try {
    await store.dispatch('marketing/campaigns/deleteCampaign', campaignToDelete.value.id);
    deleteDialog.value = false;
    campaignToDelete.value = null;
    await fetchCampaigns();
  } catch (error) {
    console.error('Error deleting campaign:', error);
  }
};

const viewAnalytics = (campaign) => {
  router.push(`/marketing/campaigns/${campaign.id}/analytics`);
};

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    paused: 'warning',
    ended: 'error',
    scheduled: 'info'
  };
  return colors[status] || 'grey';
};

const getRoiColor = (roi) => {
  if (roi > 200) return 'text-success';
  if (roi > 100) return 'text-info';
  if (roi > 0) return 'text-warning';
  return 'text-error';
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
};

const formatPercentage = (value) => {
  return `${value.toFixed(2)}%`;
};

// SEO Data Structure
const campaign = ref({
  title: 'Gestion des Campagnes Marketing',
  description: 'Plateforme de gestion des campagnes marketing - Automatisation, analytics et rapports en temps réel'
})

// Dynamic SEO Head
useHead({
  title: computed(() => `${campaign.value.title} | Marketing Dashboard`),
  meta: [
    {
      name: 'description',
      content: computed(() => campaign.value.description)
    },
    {
      property: 'og:title',
      content: computed(() => campaign.value.title)
    },
    {
      property: 'og:description',
      content: computed(() => campaign.value.description)
    }
  ]
})

// Chargement initial
onMounted(() => {
  fetchCampaigns();
});

// SEO Data Structure
const campaign = ref({
  title: 'Gestion des Campagnes Marketing',
  description: 'Plateforme de gestion des campagnes marketing - Automatisation, analytics et rapports en temps réel'
})

// Dynamic SEO Head
useHead({
  title: computed(() => `${campaign.value.title} | Marketing Dashboard`),
  meta: [
    {
      name: 'description',
      content: computed(() => campaign.value.description)
    },
    {
      property: 'og:title',
      content: computed(() => campaign.value.title)
    },
    {
      property: 'og:description',
      content: computed(() => campaign.value.description)
    }
  ]
})
</script>

<style scoped>
.text-success {
  color: var(--v-success-base);
}

.text-info {
  color: var(--v-info-base);
}

.text-warning {
  color: var(--v-warning-base);
}

.text-error {
  color: var(--v-error-base);
}
</style> 