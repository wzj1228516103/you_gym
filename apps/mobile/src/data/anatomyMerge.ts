import type { AnatomyNode, AnatomyTreeNode } from '../types';

const serverIdByLocalId: Record<string, string> = {
  'muscle.trapezius': 'muscle.trapezius.upper',
  'muscle.pectoralis-major.clavicular': 'muscle.pectoralis-major.upper',
  'muscle.pectoralis-major.sternocostal': 'muscle.pectoralis-major.lower',
  'muscle.vastus-lateralis': 'muscle.quadriceps',
  'muscle.rectus-femoris': 'muscle.quadriceps',
  'muscle.gastrocnemius.medial-head': 'muscle.gastrocnemius',
};

const serverManagedLocalIds = new Set([
  'muscle.neck', 'muscle.deltoid.anterior', 'muscle.deltoid.middle', 'muscle.deltoid.posterior',
  'muscle.pectoralis-major.clavicular', 'muscle.pectoralis-major.sternocostal', 'muscle.serratus-anterior',
  'muscle.biceps-brachii', 'muscle.triceps-brachii', 'muscle.forearm', 'muscle.rectus-abdominis',
  'muscle.external-oblique', 'muscle.latissimus-dorsi', 'muscle.trapezius', 'muscle.trapezius.middle',
  'muscle.trapezius.lower', 'muscle.erector-spinae', 'muscle.gluteus-maximus', 'muscle.gluteus-medius',
  'muscle.vastus-lateralis', 'muscle.rectus-femoris', 'muscle.hamstrings', 'muscle.adductors',
  'muscle.tibialis-anterior', 'muscle.gastrocnemius.medial-head',
]);

export function serverAnatomyId(localId: string) {
  return serverIdByLocalId[localId] ?? localId;
}

function flatten(nodes: AnatomyTreeNode[], parentById = new Map<string, AnatomyTreeNode>()) {
  const byId = new Map<string, AnatomyTreeNode>();
  const visit = (node: AnatomyTreeNode, parent?: AnatomyTreeNode) => {
    byId.set(node.id, node);
    if (parent) parentById.set(node.id, parent);
    node.children.forEach((child) => visit(child, node));
  };
  nodes.forEach((node) => visit(node));
  return { byId, parentById };
}

function rootRegion(node: AnatomyTreeNode, parentById: Map<string, AnatomyTreeNode>) {
  let current = node;
  while (parentById.has(current.id)) current = parentById.get(current.id)!;
  return current.nameZh;
}

export function mergeAnatomyNodes(localNodes: AnatomyNode[], tree: AnatomyTreeNode[]) {
  const { byId, parentById } = flatten(tree);
  return localNodes.flatMap((local) => {
    const serverId = serverIdByLocalId[local.id] ?? local.id;
    const server = byId.get(serverId);
    if (!server) return serverManagedLocalIds.has(local.id) ? [] : [local];
    const isGenericAlias = serverId === 'muscle.quadriceps' || serverId === 'muscle.gastrocnemius';
    return [{
      ...local,
      region: rootRegion(server, parentById),
      displayName: isGenericAlias ? `${server.nameZh} · ${local.part}` : server.nameZh,
      nameEn: isGenericAlias ? local.nameEn : server.nameEn,
    }];
  });
}
