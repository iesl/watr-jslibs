/**
 *
 */


interface CorpusLock {
    document: string;
    holder: number; // nullable
    id: number;
    lockPath: string;
    status: string;
}

interface WorkflowRecord {
    labelSchemas: LabelSchemas;
    targetPath: string;
    workflow: string;
}

interface LockedWorkflowRecs {
    lockedRecord: CorpusLock;
    workflowRecord: WorkflowRecord
}


interface LabelSchemas {
    name: string;
    schemas: LabelSchema[];
}

interface LabelSchema {
    label: string;
    description: string;
    children: LabelSchema[];
    abbrev: [string, string];
}

function asSchema(s: LabelSchemas): LabelSchemas {
    return s;
}

