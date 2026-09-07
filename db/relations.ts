import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

/**
 * Single source of truth for every relationship in the schema, per the
 * Relational Queries v2 API (https://orm.drizzle.team/docs/relations-v1-v2).
 *
 * Junction tables that carry no meaningful payload beyond the two FKs
 * (user_technology, user_interest) are collapsed with `.through()` so callers
 * never have to touch the junction row directly. Junctions that DO carry
 * payload (content_context_media has `note`; draft_media has `position` /
 * `x_thread_post_id`; user_discovery_item has `relevanceScore` / `seenAt` /
 * etc.) are kept as explicit one/many pairs instead — collapsing those with
 * `through` would hide data callers actually need.
 */
export const relations = defineRelations(schema, (r) => ({
  user: {
    applicationProfile: r.one.applicationProfile({
      from: r.user.id,
      to: r.applicationProfile.userId,
    }),
    technologies: r.many.technology({
      from: r.user.id.through(r.userTechnology.userId),
      to: r.technology.id.through(r.userTechnology.technologyId),
    }),
    interests: r.many.interest({
      from: r.user.id.through(r.userInterest.userId),
      to: r.interest.id.through(r.userInterest.interestId),
    }),
    socialConnections: r.many.socialConnection(),
    media: r.many.media(),
    content: r.many.content(),
    research: r.many.research(),
    publications: r.many.publication(),
    notifications: r.many.notification(),
    notificationPreference: r.one.notificationPreference({
      from: r.user.id,
      to: r.notificationPreference.userId,
    }),
    discoveryFeed: r.many.userDiscoveryItem(),
  },

  applicationProfile: {
    user: r.one.user({
      from: r.applicationProfile.userId,
      to: r.user.id,
      optional: false,
    }),
  },

  technology: {
    users: r.many.user({
      from: r.technology.id.through(r.userTechnology.technologyId),
      to: r.user.id.through(r.userTechnology.userId),
    }),
  },

  interest: {
    users: r.many.user({
      from: r.interest.id.through(r.userInterest.interestId),
      to: r.user.id.through(r.userInterest.userId),
    }),
  },

  socialConnection: {
    user: r.one.user({
      from: r.socialConnection.userId,
      to: r.user.id,
      optional: false,
    }),
    publications: r.many.publication(),
    externalPosts: r.many.xExternalPost(),
  },

  content: {
    user: r.one.user({
      from: r.content.userId,
      to: r.user.id,
      optional: false,
    }),
    research: r.one.research({
      from: r.content.researchId,
      to: r.research.id,
    }),
    discoveryItem: r.one.discoveryItem({
      from: r.content.discoveryItemId,
      to: r.discoveryItem.id,
    }),
    contextAttachments: r.many.contentContextMedia(),
    angles: r.many.angle(),
    compositions: r.many.composition(),
  },

  contentContextMedia: {
    content: r.one.content({
      from: r.contentContextMedia.contentId,
      to: r.content.id,
      optional: false,
    }),
    media: r.one.media({
      from: r.contentContextMedia.mediaId,
      to: r.media.id,
      optional: false,
    }),
  },

  angle: {
    content: r.one.content({
      from: r.angle.contentId,
      to: r.content.id,
    }),
    research: r.one.research({
      from: r.angle.researchId,
      to: r.research.id,
    }),
    compositions: r.many.composition(),
  },

  composition: {
    content: r.one.content({
      from: r.composition.contentId,
      to: r.content.id,
      optional: false,
    }),
    angle: r.one.angle({
      from: r.composition.angleId,
      to: r.angle.id,
    }),
    // A Composition can have up to one Draft per platform (LinkedIn + X) —
    // never a single `one` relation. Enforced by the unique constraint on
    // draft (composition_id, platform), not by the relation shape.
    drafts: r.many.draft(),
    publications: r.many.publication(),
  },

  draft: {
    composition: r.one.composition({
      from: r.draft.compositionId,
      to: r.composition.id,
      optional: false,
    }),
    threadPosts: r.many.xThreadPost(),
    mediaAttachments: r.many.draftMedia(),
    aiGenerations: r.many.aiGeneration(),
    pendingAiGeneration: r.one.aiGeneration({
      from: r.draft.pendingAiGenerationId,
      to: r.aiGeneration.id,
      alias: "draft_pending_ai_generation",
    }),
    currentAiGeneration: r.one.aiGeneration({
      from: r.draft.currentAiGenerationId,
      to: r.aiGeneration.id,
      alias: "draft_current_ai_generation",
    }),
    targetExternalPost: r.one.xExternalPost({
      from: r.draft.targetExternalPostId,
      to: r.xExternalPost.id,
    }),
    targetPublication: r.one.publication({
      from: r.draft.targetPublicationId,
      to: r.publication.id,
      alias: "draft_target_publication",
    }),
    publications: r.many.publication({
      alias: "publication_source_draft",
    }),
  },

  xThreadPost: {
    draft: r.one.draft({
      from: r.xThreadPost.draftId,
      to: r.draft.id,
      optional: false,
    }),
    mediaAttachments: r.many.draftMedia(),
    aiGenerations: r.many.aiGeneration(),
  },

  xExternalPost: {
    socialConnection: r.one.socialConnection({
      from: r.xExternalPost.socialConnectionId,
      to: r.socialConnection.id,
      optional: false,
    }),
  },

  media: {
    user: r.one.user({
      from: r.media.userId,
      to: r.user.id,
      optional: false,
    }),
    contextUsages: r.many.contentContextMedia(),
    draftUsages: r.many.draftMedia(),
  },

  draftMedia: {
    draft: r.one.draft({
      from: r.draftMedia.draftId,
      to: r.draft.id,
      optional: false,
    }),
    media: r.one.media({
      from: r.draftMedia.mediaId,
      to: r.media.id,
      optional: false,
    }),
    xThreadPost: r.one.xThreadPost({
      from: r.draftMedia.xThreadPostId,
      to: r.xThreadPost.id,
    }),
  },

  publication: {
    user: r.one.user({
      from: r.publication.userId,
      to: r.user.id,
      optional: false,
    }),
    composition: r.one.composition({
      from: r.publication.compositionId,
      to: r.composition.id,
      optional: false,
    }),
    sourceDraft: r.one.draft({
      from: r.publication.draftId,
      to: r.draft.id,
      alias: "publication_source_draft",
    }),
    socialConnection: r.one.socialConnection({
      from: r.publication.socialConnectionId,
      to: r.socialConnection.id,
    }),
  },

  aiGeneration: {
    draft: r.one.draft({
      from: r.aiGeneration.draftId,
      to: r.draft.id,
      optional: false,
    }),
    targetXThreadPost: r.one.xThreadPost({
      from: r.aiGeneration.targetXThreadPostId,
      to: r.xThreadPost.id,
    }),
  },

  research: {
    user: r.one.user({
      from: r.research.userId,
      to: r.user.id,
      optional: false,
    }),
    sources: r.many.researchSource(),
    angles: r.many.angle(),
    contents: r.many.content(),
  },

  researchSource: {
    research: r.one.research({
      from: r.researchSource.researchId,
      to: r.research.id,
      optional: false,
    }),
  },

  discoveryItem: {
    userStates: r.many.userDiscoveryItem(),
    contents: r.many.content(),
  },

  userDiscoveryItem: {
    user: r.one.user({
      from: r.userDiscoveryItem.userId,
      to: r.user.id,
      optional: false,
    }),
    discoveryItem: r.one.discoveryItem({
      from: r.userDiscoveryItem.discoveryItemId,
      to: r.discoveryItem.id,
      optional: false,
    }),
  },

  notification: {
    user: r.one.user({
      from: r.notification.userId,
      to: r.user.id,
      optional: false,
    }),
  },

  notificationPreference: {
    user: r.one.user({
      from: r.notificationPreference.userId,
      to: r.user.id,
      optional: false,
    }),
  },
}));
