import path from 'path'

export default (config/*, env, helpers, options*/) => {
    // console.log(config.module)
    config.module.rules[4].include = [
        path.resolve(__dirname, 'src', 'routes'),
        path.resolve(__dirname, 'src', 'components'),
        path.resolve(__dirname, 'src', 'sections'),
        path.resolve(__dirname, 'src', 'context')
      ];
      
      config.module.rules[5].exclude = [
        path.resolve(__dirname, 'src', 'routes'),
        path.resolve(__dirname, 'src', 'components'),
        path.resolve(__dirname, 'src', 'sections'),
        path.resolve(__dirname, 'src', 'context')
      ];
}