package db

import (
	"fmt"
	"strings"
)

func InnerJoin(left, right []map[string]interface{}, leftCol, rightCol string) []map[string]interface{} {
	var result []map[string]interface{}
	for _, l := range left {
		for _, r := range right {
			if fmt.Sprintf("%v", l[leftCol]) == fmt.Sprintf("%v", r[rightCol]) {
				result = append(result, mergeMaps(l, r))
			}
		}
	}
	return result
}

func LeftJoin(left, right []map[string]interface{}, leftCol, rightCol string) []map[string]interface{} {
	var result []map[string]interface{}
	for _, l := range left {
		matched := false
		for _, r := range right {
			if fmt.Sprintf("%v", l[leftCol]) == fmt.Sprintf("%v", r[rightCol]) {
				result = append(result, mergeMaps(l, r))
				matched = true
			}
		}
		if !matched {
			result = append(result, mergeMaps(l, nil))
		}
	}
	return result
}

func RightJoin(left, right []map[string]interface{}, leftCol, rightCol string) []map[string]interface{} {
	var result []map[string]interface{}
	for _, r := range right {
		matched := false
		for _, l := range left {
			if fmt.Sprintf("%v", l[leftCol]) == fmt.Sprintf("%v", r[rightCol]) {
				result = append(result, mergeMaps(l, r))
				matched = true
			}
		}
		if !matched {
			result = append(result, mergeMaps(nil, r))
		}
	}
	return result
}

func FullJoin(left, right []map[string]interface{}, leftCol, rightCol string) []map[string]interface{} {
	leftJoined := LeftJoin(left, right, leftCol, rightCol)
	rightOnly := []map[string]interface{}{}
	for _, r := range right {
		found := false
		for _, l := range left {
			if fmt.Sprintf("%v", l[leftCol]) == fmt.Sprintf("%v", r[rightCol]) {
				found = true
				break
			}
		}
		if !found {
			rightOnly = append(rightOnly, mergeMaps(nil, r))
		}
	}
	return append(leftJoined, rightOnly...)
}

func CrossJoin(left, right []map[string]interface{}) []map[string]interface{} {
	var result []map[string]interface{}
	for _, l := range left {
		for _, r := range right {
			result = append(result, mergeMaps(l, r))
		}
	}
	return result
}

func mergeMaps(left, right map[string]interface{}) map[string]interface{} {
	merged := map[string]interface{}{}
	if left != nil {
		for k, v := range left {
			merged["left_"+k] = v
		}
	}
	if right != nil {
		for k, v := range right {
			merged["right_"+k] = v
		}
	}
	return merged
}

func DispatchJoin(joinType string, left, right []map[string]interface{}, leftCol, rightCol string) ([]map[string]interface{}, error) {
	switch strings.ToUpper(joinType) {
	case "INNER":
		return InnerJoin(left, right, leftCol, rightCol), nil
	case "LEFT":
		return LeftJoin(left, right, leftCol, rightCol), nil
	case "RIGHT":
		return RightJoin(left, right, leftCol, rightCol), nil
	case "FULL":
		return FullJoin(left, right, leftCol, rightCol), nil
	case "CROSS":
		return CrossJoin(left, right), nil
	default:
		return nil, fmt.Errorf("unsupported join type: %s", joinType)
	}
}
