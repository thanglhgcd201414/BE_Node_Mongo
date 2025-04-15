/**
 * @todo Loại bỏ các trường là falsy trong obj
 * @param {Object} params - obj được truyền vào
 * @param {Array} arrayValueAccepted - mảng giá trị được chấp nhận và không muốn bỏ qua
 * @returns {Object} - object đã loại bỏ các trường là falsy trong obj
 */
const onRemoveParams = <T extends Record<string, any>>(
  params: T,
  arrayValueAccepted: any[] = []
): Partial<T> => {
  // Chọn các giá trị được chấp nhận trong mảng truyền vào
  const onCheckAcceptedValue = (value: any): boolean => {
    if (arrayValueAccepted.length === 0) return false;
    return arrayValueAccepted.includes(value);
  };

  const handleRemoveNullUndefined = (obj: T): Partial<T> => {
    if (!obj) return {};
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([_, value]) => Boolean(value) || onCheckAcceptedValue(value)
      )
    ) as Partial<T>;
  };

  return handleRemoveNullUndefined(params);
};

export default onRemoveParams;
