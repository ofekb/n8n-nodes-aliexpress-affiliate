"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNodesGraph = exports.getDomainPath = exports.ANONYMIZATION_CHARACTER = exports.getDomainBase = exports.isNumber = exports.getNodeTypeForName = void 0;
const STICKY_NODE_TYPE = 'n8n-nodes-base.stickyNote';
function getNodeTypeForName(workflow, nodeName) {
    return workflow.nodes.find((node) => node.name === nodeName);
}
exports.getNodeTypeForName = getNodeTypeForName;
function isNumber(value) {
    return typeof value === 'number';
}
exports.isNumber = isNumber;
function getStickyDimensions(note, stickyType) {
    var _a, _b;
    const heightProperty = (_a = stickyType === null || stickyType === void 0 ? void 0 : stickyType.description) === null || _a === void 0 ? void 0 : _a.properties.find((property) => property.name === 'height');
    const widthProperty = (_b = stickyType === null || stickyType === void 0 ? void 0 : stickyType.description) === null || _b === void 0 ? void 0 : _b.properties.find((property) => property.name === 'width');
    const defaultHeight = heightProperty && isNumber(heightProperty === null || heightProperty === void 0 ? void 0 : heightProperty.default) ? heightProperty.default : 0;
    const defaultWidth = widthProperty && isNumber(widthProperty === null || widthProperty === void 0 ? void 0 : widthProperty.default) ? widthProperty.default : 0;
    const height = isNumber(note.parameters.height) ? note.parameters.height : defaultHeight;
    const width = isNumber(note.parameters.width) ? note.parameters.width : defaultWidth;
    return {
        height,
        width,
    };
}
function areOverlapping(topLeft, bottomRight, targetPos) {
    return (targetPos[0] > topLeft[0] &&
        targetPos[1] > topLeft[1] &&
        targetPos[0] < bottomRight[0] &&
        targetPos[1] < bottomRight[1]);
}
const URL_PARTS_REGEX = /(?<protocolPlusDomain>.*?\..*?)(?<pathname>\/.*)/;
function getDomainBase(raw, urlParts = URL_PARTS_REGEX) {
    var _a;
    try {
        const url = new URL(raw);
        return [url.protocol, url.hostname].join('//');
    }
    catch {
        const match = urlParts.exec(raw);
        if (!((_a = match === null || match === void 0 ? void 0 : match.groups) === null || _a === void 0 ? void 0 : _a.protocolPlusDomain))
            return '';
        return match.groups.protocolPlusDomain;
    }
}
exports.getDomainBase = getDomainBase;
function isSensitive(segment) {
    if (/^v\d+$/.test(segment))
        return false;
    return /%40/.test(segment) || /\d/.test(segment) || /^[0-9A-F]{8}/i.test(segment);
}
exports.ANONYMIZATION_CHARACTER = '*';
function sanitizeRoute(raw, check = isSensitive, char = exports.ANONYMIZATION_CHARACTER) {
    return raw
        .split('/')
        .map((segment) => (check(segment) ? char.repeat(segment.length) : segment))
        .join('/');
}
function getDomainPath(raw, urlParts = URL_PARTS_REGEX) {
    var _a;
    try {
        const url = new URL(raw);
        if (!url.hostname)
            throw new Error('Malformed URL');
        return sanitizeRoute(url.pathname);
    }
    catch {
        const match = urlParts.exec(raw);
        if (!((_a = match === null || match === void 0 ? void 0 : match.groups) === null || _a === void 0 ? void 0 : _a.pathname))
            return '';
        const route = match.groups.pathname.split('?').shift();
        return sanitizeRoute(route);
    }
}
exports.getDomainPath = getDomainPath;
function generateNodesGraph(workflow, nodeTypes, options) {
    var _a;
    const nodesGraph = {
        node_types: [],
        node_connections: [],
        nodes: {},
        notes: {},
        is_pinned: Object.keys((_a = workflow.pinData) !== null && _a !== void 0 ? _a : {}).length > 0,
    };
    const nodeNameAndIndex = {};
    const webhookNodeNames = [];
    try {
        const notes = workflow.nodes.filter((node) => node.type === STICKY_NODE_TYPE);
        const otherNodes = workflow.nodes.filter((node) => node.type !== STICKY_NODE_TYPE);
        notes.forEach((stickyNote, index) => {
            const stickyType = nodeTypes.getByNameAndVersion(STICKY_NODE_TYPE, stickyNote.typeVersion);
            const { height, width } = getStickyDimensions(stickyNote, stickyType);
            const topLeft = stickyNote.position;
            const bottomRight = [topLeft[0] + width, topLeft[1] + height];
            const overlapping = Boolean(otherNodes.find((node) => areOverlapping(topLeft, bottomRight, node.position)));
            nodesGraph.notes[index] = {
                overlapping,
                position: topLeft,
                height,
                width,
            };
        });
        otherNodes.forEach((node, index) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            nodesGraph.node_types.push(node.type);
            const nodeItem = {
                id: node.id,
                type: node.type,
                position: node.position,
            };
            if (options === null || options === void 0 ? void 0 : options.sourceInstanceId) {
                nodeItem.src_instance_id = options.sourceInstanceId;
            }
            if (node.id && (options === null || options === void 0 ? void 0 : options.nodeIdMap) && options.nodeIdMap[node.id]) {
                nodeItem.src_node_id = options.nodeIdMap[node.id];
            }
            if (node.type === 'n8n-nodes-base.httpRequest' && node.typeVersion === 1) {
                try {
                    nodeItem.domain = new URL(node.parameters.url).hostname;
                }
                catch {
                    nodeItem.domain = getDomainBase(node.parameters.url);
                }
            }
            else if (node.type === 'n8n-nodes-base.httpRequest' && [2, 3].includes(node.typeVersion)) {
                const { authentication } = node.parameters;
                nodeItem.credential_type = {
                    none: 'none',
                    genericCredentialType: node.parameters.genericAuthType,
                    predefinedCredentialType: node.parameters.nodeCredentialType,
                }[authentication];
                nodeItem.credential_set = node.credentials
                    ? Object.keys(node.credentials).length > 0
                    : false;
                const { url } = node.parameters;
                nodeItem.domain_base = getDomainBase(url);
                nodeItem.domain_path = getDomainPath(url);
                nodeItem.method = node.parameters.requestMethod;
            }
            else if (node.type === 'n8n-nodes-base.webhook') {
                webhookNodeNames.push(node.name);
            }
            else {
                const nodeType = nodeTypes.getByNameAndVersion(node.type);
                (_b = (_a = nodeType === null || nodeType === void 0 ? void 0 : nodeType.description) === null || _a === void 0 ? void 0 : _a.properties) === null || _b === void 0 ? void 0 : _b.forEach((property) => {
                    if (property.name === 'operation' ||
                        property.name === 'resource' ||
                        property.name === 'mode') {
                        nodeItem[property.name] = property.default ? property.default.toString() : undefined;
                    }
                });
                nodeItem.operation = (_d = (_c = node.parameters.operation) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : nodeItem.operation;
                nodeItem.resource = (_f = (_e = node.parameters.resource) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : nodeItem.resource;
                nodeItem.mode = (_h = (_g = node.parameters.mode) === null || _g === void 0 ? void 0 : _g.toString()) !== null && _h !== void 0 ? _h : nodeItem.mode;
            }
            nodesGraph.nodes[`${index}`] = nodeItem;
            nodeNameAndIndex[node.name] = index.toString();
        });
        const getGraphConnectionItem = (startNode, connectionItem) => {
            return { start: nodeNameAndIndex[startNode], end: nodeNameAndIndex[connectionItem.node] };
        };
        Object.keys(workflow.connections).forEach((nodeName) => {
            const connections = workflow.connections[nodeName];
            connections.main.forEach((element) => {
                element.forEach((element2) => {
                    nodesGraph.node_connections.push(getGraphConnectionItem(nodeName, element2));
                });
            });
        });
    }
    catch (e) {
        return { nodeGraph: nodesGraph, nameIndices: nodeNameAndIndex, webhookNodeNames };
    }
    return { nodeGraph: nodesGraph, nameIndices: nodeNameAndIndex, webhookNodeNames };
}
exports.generateNodesGraph = generateNodesGraph;
//# sourceMappingURL=TelemetryHelpers.js.map