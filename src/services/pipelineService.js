import { getData, updateData, simulateApi } from './storageService';
import { storyService } from './storyService';

const PIPELINE_KEY = 'silvertriverse_pro_pipelines';

// Helper to get full story details mixed with pipeline stage
const enrichPipelineItems = async (pipelineItems) => {
    // We need to fetch stories to get their titles, authors, etc.
    const response = await storyService.getStories();
    const allStories = response.success ? response.data : [];

    return pipelineItems.map(item => {
        const story = allStories.find(s => s.id === item.storyId);
        return {
            ...item,
            story: story || { title: 'Unknown Story', genre: 'Unknown' } // Fallback
        };
    });
};

export const pipelineService = {
    getPipeline: async (professionalId) => {
        const response = await simulateApi(() => {
            const allPipelines = getData(PIPELINE_KEY, {});
            return allPipelines[professionalId] || [];
        });

        // Enrich outside the simulated synchronous API delay wrapper
        if (response.success) {
            response.data = await enrichPipelineItems(response.data);
        }
        return response;
    },

    addToPipeline: (professionalId, storyId, initialStage = 'inbox') => {
        return simulateApi(() => {
            let addedItem = null;
            updateData(PIPELINE_KEY, (pipelines) => {
                const userPipeline = pipelines[professionalId] || [];

                // Avoid duplicates
                if (userPipeline.some(item => item.storyId === storyId)) {
                    return pipelines;
                }

                addedItem = {
                    storyId,
                    stage: initialStage,
                    addedAt: Date.now()
                };

                return {
                    ...pipelines,
                    [professionalId]: [...userPipeline, addedItem]
                };
            }, {});

            if (!addedItem) throw new Error('Story is already in your pipeline');
            return addedItem;
        });
    },

    updateStage: (professionalId, storyId, newStage) => {
        return simulateApi(() => {
            let updatedItem = null;
            updateData(PIPELINE_KEY, (pipelines) => {
                const userPipeline = pipelines[professionalId] || [];
                const itemIndex = userPipeline.findIndex(item => item.storyId === storyId);

                if (itemIndex > -1) {
                    updatedItem = { ...userPipeline[itemIndex], stage: newStage };
                    const newPipeline = [...userPipeline];
                    newPipeline[itemIndex] = updatedItem;
                    return { ...pipelines, [professionalId]: newPipeline };
                }
                return pipelines;
            }, {});

            if (!updatedItem) throw new Error('Item not found in pipeline');
            return updatedItem;
        });
    },

    removeFromPipeline: (professionalId, storyId) => {
        return simulateApi(() => {
            updateData(PIPELINE_KEY, (pipelines) => {
                const userPipeline = pipelines[professionalId] || [];
                return {
                    ...pipelines,
                    [professionalId]: userPipeline.filter(item => item.storyId !== storyId)
                };
            }, {});
            return true;
        });
    }
};
