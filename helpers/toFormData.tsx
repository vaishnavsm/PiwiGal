export const toFormData = (obj: any) => {
  const form = new FormData();
  Object.keys(obj)
    .forEach((key) => {
      if(Array.isArray(obj[key])){
        for(const val of obj[key]) {
          form.append(key+"[]", val);
        }
      }
      else form.append(key, obj[key]);
    })
  return form;
}