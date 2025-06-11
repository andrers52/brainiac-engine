// Module loader to handle mixed CommonJS and ES modules
export async function resolve(specifier, context, nextResolve) {
  // Let Node.js handle arslib's internal modules as CommonJS
  if (specifier.includes("arslib") && specifier.includes("node-console-log")) {
    return {
      format: "commonjs",
      shortCircuit: true,
      url: new URL(specifier, context.parentURL).href,
    };
  }

  return nextResolve(specifier, context);
}
