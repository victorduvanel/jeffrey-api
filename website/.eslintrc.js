module.exports = {
  parserOptions: {
    sourceType: 'module'
  },
  extends: 'eslint:recommended',
  env: {
    "browser": true,
    "es6": true,
    "node": true
  },
  rules: {
    "strict": 0,
    "indent": [
      "error",
      2,
      {
        "SwitchCase": 1
      }
    ],
    "no-trailing-spaces": [
      "error"
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single",
      {
        "allowTemplateLiterals": true
      }
    ],
    "semi": [
      "error",
      "always"
    ],
    "quote-props": [
      "error",
      "as-needed"
    ]
  }
};
