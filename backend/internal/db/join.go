package db

import (
	"fmt"
	"strings"
)

func mergeMaps(left, right map[string]interface{}, leftSourceID, rightSourceID string) map[string]interface{} {
	merged := make(map[string]interface{})

	if left != nil {
		for k, v := range left {
			merged[leftSourceID+"_L_"+k] = v
		}
	}

	if right != nil {
		for k, v := range right {
			merged[rightSourceID+"_R_"+k] = v
		}
	}

	return merged
}

func InnerJoin(left, right []map[string]interface{}, leftCol, rightCol, leftSourceID, rightSourceID string) []map[string]interface{} {
	var result []map[string]interface{}
	for _, l := range left {
		for _, r := range right {
			if fmt.Sprintf("%v", l[leftCol]) == fmt.Sprintf("%v", r[rightCol]) {
				result = append(result, mergeMaps(l, r, leftSourceID, rightSourceID))
			}
		}
	}
	return result
}

func LeftJoin(left, right []map[string]interface{}, leftCol, rightCol, leftSourceID, rightSourceID string) []map[string]interface{} {
	var result []map[string]interface{}
	for _, l := range left {
		matched := false
		for _, r := range right {
			if fmt.Sprintf("%v", l[leftCol]) == fmt.Sprintf("%v", r[rightCol]) {
				result = append(result, mergeMaps(l, r, leftSourceID, rightSourceID))
				matched = true
			}
		}
		if !matched {
			result = append(result, mergeMaps(l, nil, leftSourceID, rightSourceID))
		}
	}
	return result
}

func RightJoin(left, right []map[string]interface{}, leftCol, rightCol, leftSourceID, rightSourceID string) []map[string]interface{} {
	var result []map[string]interface{}
	for _, r := range right {
		matched := false
		for _, l := range left {
			if fmt.Sprintf("%v", l[leftCol]) == fmt.Sprintf("%v", r[rightCol]) {
				result = append(result, mergeMaps(l, r, leftSourceID, rightSourceID))
				matched = true
			}
		}
		if !matched {
			result = append(result, mergeMaps(nil, r, leftSourceID, rightSourceID))
		}
	}
	return result
}

func FullJoin(left, right []map[string]interface{}, leftCol, rightCol, leftSourceID, rightSourceID string) []map[string]interface{} {
	leftJoined := LeftJoin(left, right, leftCol, rightCol, leftSourceID, rightSourceID)
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
			rightOnly = append(rightOnly, mergeMaps(nil, r, leftSourceID, rightSourceID))
		}
	}
	return append(leftJoined, rightOnly...)
}

func CrossJoin(left, right []map[string]interface{}, leftSourceID, rightSourceID string) []map[string]interface{} {
	var result []map[string]interface{}
	for _, l := range left {
		for _, r := range right {
			result = append(result, mergeMaps(l, r, leftSourceID, rightSourceID))
		}
	}
	return result
}

func DispatchJoin(joinType string, left, right []map[string]interface{}, leftCol, rightCol, leftSourceID, rightSourceID string) ([]map[string]interface{}, error) {
	switch strings.ToUpper(joinType) {
	case "INNER":
		return InnerJoin(left, right, leftCol, rightCol, leftSourceID, rightSourceID), nil
	case "LEFT":
		return LeftJoin(left, right, leftCol, rightCol, leftSourceID, rightSourceID), nil
	case "RIGHT":
		return RightJoin(left, right, leftCol, rightCol, leftSourceID, rightSourceID), nil
	case "FULL":
		return FullJoin(left, right, leftCol, rightCol, leftSourceID, rightSourceID), nil
	case "CROSS":
		return CrossJoin(left, right, leftSourceID, rightSourceID), nil
	default:
		return nil, fmt.Errorf("unsupported join type: %s", joinType)
	}
}
