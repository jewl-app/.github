import { getCluster } from "@/core/cluster";
import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useConnection } from "@/app/hooks/connection";
import { useAnalytics } from "@/app/hooks/analytics";

export interface UseCluster {
  readonly cluster: string | null;
}

const ClusterContext = createContext<UseCluster>({
  cluster: null,
});

export function useCluster (): UseCluster {
  return useContext(ClusterContext);
}

export default function ClusterProvider (props: PropsWithChildren): ReactElement {
  const { connection } = useConnection();
  const [cluster, setCluster] = useState<string | null>(null);
  const { logError } = useAnalytics();

  useEffect(() => {
    getCluster(connection)
      .then(setCluster)
      .catch(logError);
  }, [logError]);

  const context = useMemo(() => {
    return { cluster };
  }, [cluster]);

  return (
    <ClusterContext.Provider value={context}>
      {props.children}
    </ClusterContext.Provider>
  );
}
