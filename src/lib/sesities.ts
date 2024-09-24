import { StaticModuleRecord } from '@endo/static-module-record';

const rawModules: Record<string, object> = {};

const syntheticModulesCompartment = new Compartment(
  {},
  {},
  {
    name: 'syntheticModules',
    resolveHook: (moduleSpecifier) => moduleSpecifier,
    importHook: async (moduleSpecifier) => {
      const ns =
        rawModules[moduleSpecifier].default || rawModules[moduleSpecifier];

      const staticModuleRecord = Object.freeze({
        imports: [],
        exports: Array.from(new Set(Object.keys(ns).concat(['default']))),
        execute: (moduleExports: any) => {
          Object.assign(moduleExports, ns);
          moduleExports.default = ns;
        },
      });
      return staticModuleRecord;
    },
  },
);
export const addToCompartment = async (name: string, nsObject: object) => {
  rawModules[name] = nsObject;
  return (await syntheticModulesCompartment.import(name)).namespace;
};

export const getRemoteModuleRecord = async (specifier: string) => {
  if (specifier.startsWith('https://')) {
    const remoteCode = await fetch(specifier).then((res) => res.text());
    return new StaticModuleRecord(remoteCode, specifier);
  }

  let url = `https://esm.run/${specifier}`;
  if (specifier.startsWith('/npm/')) {
    url = `https://cdn.jsdelivr.net${specifier}`;
  }
  const remoteCode = await fetch(url).then((res) => {
    if (!res.ok) {
      throw Error(`Cannot import ${specifier}`);
    }
    return res.text();
  });
  return new StaticModuleRecord(
    remoteCode.replace('<!', '< !').replace('-->', '-- >'),
    specifier,
  );
};

// sesities - It's a pun on necessities and SES if you didn't notice